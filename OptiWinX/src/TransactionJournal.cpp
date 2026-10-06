/**
 * OptiWinX Native Windows Optimizer v2.0
 * Source: TransactionJournal.cpp
 * 
 * Transaction Journal & Crash Recovery Engine Implementation
 */

#include "TransactionJournal.hpp"
#include "ProcessEngine.hpp"
#include <fstream>
#include <sstream>
#include <iostream>
#include <ctime>
#include <iomanip>

namespace OptiWin {

static std::string GenerateTxId(uint32_t pid) {
    auto now = std::chrono::system_clock::now().time_since_epoch().count();
    return "TX-" + std::to_string(pid) + "-" + std::to_string(now % 1000000);
}

static std::string GetTimestampNow() {
    auto now = std::chrono::system_clock::now();
    std::time_t now_c = std::chrono::system_clock::to_time_t(now);
    std::tm tm_buf{};
#if defined(_WIN32) || defined(__CYGWIN__) || defined(__MINGW32__)
    localtime_s(&tm_buf, &now_c);
#else
    localtime_r(&now_c, &tm_buf);
#endif
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", &tm_buf);
    return std::string(buf);
}

TransactionJournal::TransactionJournal(const std::string& journalFilePath)
    : journalPath_(journalFilePath) {
    LoadJournal();
}

TransactionJournal::~TransactionJournal() {
    PersistJournal();
}

std::string TransactionJournal::BeginTransaction(uint32_t pid, const std::string& processName,
                                                 uint32_t origPriority, bool origEcoQoS,
                                                 uint32_t modPriority, bool modEcoQoS,
                                                 const std::string& reason, RiskLevel risk) {
    std::lock_guard<std::mutex> lock(journalMutex_);
    TransactionEntry entry;
    entry.transactionId = GenerateTxId(pid);
    entry.pid = pid;
    entry.processName = processName;
    entry.originalPriority = origPriority;
    entry.originalEcoQoS = origEcoQoS;
    entry.modifiedPriority = modPriority;
    entry.modifiedEcoQoS = modEcoQoS;
    entry.reason = reason;
    entry.risk = risk;
    entry.status = TransactionStatus::Pending;
    entry.timestamp = GetTimestampNow();
    entry.verificationResult = "Pending application";

    entries_.push_back(entry);
    PersistJournal();
    return entry.transactionId;
}

void TransactionJournal::MarkApplied(const std::string& transactionId, const std::string& verificationMsg) {
    std::lock_guard<std::mutex> lock(journalMutex_);
    for (auto& entry : entries_) {
        if (entry.transactionId == transactionId) {
            entry.status = TransactionStatus::Verified;
            entry.verificationResult = verificationMsg;
            break;
        }
    }
    PersistJournal();
}

bool TransactionJournal::RollbackTransaction(const std::string& transactionId, ProcessEngine& engine, std::string& outMessage) {
    std::lock_guard<std::mutex> lock(journalMutex_);
    for (auto& entry : entries_) {
        if (entry.transactionId == transactionId) {
            if (entry.status == TransactionStatus::RolledBack) {
                outMessage = "Transaction " + transactionId + " already rolled back.";
                return true;
            }

            // Check if process is still running
            auto procOpt = engine.QueryProcess(entry.pid);
            if (!procOpt.has_value() || procOpt->name != entry.processName) {
                entry.status = TransactionStatus::NoLongerExists;
                outMessage = "Process '" + entry.processName + "' (PID " + std::to_string(entry.pid) + ") no longer exists; no restoration required.";
                PersistJournal();
                return true;
            }

            // Restore original priority
            bool prioOk = true;
            if (entry.modifiedPriority != entry.originalPriority) {
                auto pRes = engine.SetProcessPriority(entry.pid, entry.originalPriority);
                prioOk = pRes.success;
            }

            // Restore original EcoQoS
            bool ecoOk = true;
            if (entry.modifiedEcoQoS != entry.originalEcoQoS) {
                auto eRes = engine.SetProcessEcoQoS(entry.pid, entry.originalEcoQoS);
                ecoOk = eRes.success;
            }

            if (prioOk && ecoOk) {
                entry.status = TransactionStatus::RolledBack;
                outMessage = "Successfully restored '" + entry.processName + "' (PID " + std::to_string(entry.pid) 
                           + ") to Priority: " + ProcessEngine::PriorityToString(entry.originalPriority) 
                           + ", EcoQoS: " + (entry.originalEcoQoS ? "ON" : "OFF");
                PersistJournal();
                return true;
            } else {
                entry.status = TransactionStatus::Failed;
                outMessage = "Rollback verification failed for PID " + std::to_string(entry.pid) + ". Access restricted or handle invalid.";
                PersistJournal();
                return false;
            }
        }
    }
    outMessage = "Transaction " + transactionId + " not found.";
    return false;
}

std::vector<std::string> TransactionJournal::RollbackAll(ProcessEngine& engine) {
    std::vector<std::string> results;
    std::vector<std::string> activeIds;

    {
        std::lock_guard<std::mutex> lock(journalMutex_);
        for (const auto& e : entries_) {
            if (e.status == TransactionStatus::Verified || e.status == TransactionStatus::Applied || e.status == TransactionStatus::Pending) {
                activeIds.push_back(e.transactionId);
            }
        }
    }

    if (activeIds.empty()) {
        results.push_back("No active transactions requiring rollback.");
        return results;
    }

    for (const auto& txId : activeIds) {
        std::string msg;
        RollbackTransaction(txId, engine, msg);
        results.push_back(msg);
    }

    PruneJournal();
    return results;
}

std::vector<std::string> TransactionJournal::RecoverCrashedSession(ProcessEngine& engine) {
    std::vector<std::string> recoveryLogs;
    std::vector<std::string> unrecoveredIds;

    {
        std::lock_guard<std::mutex> lock(journalMutex_);
        for (const auto& e : entries_) {
            if (e.status == TransactionStatus::Verified || e.status == TransactionStatus::Applied) {
                unrecoveredIds.push_back(e.transactionId);
            }
        }
    }

    if (unrecoveredIds.empty()) {
        return recoveryLogs; // Clean state
    }

    recoveryLogs.push_back("Crash recovery: Detected " + std::to_string(unrecoveredIds.size()) + " unfinalized transaction(s) from prior session.");

    for (const auto& txId : unrecoveredIds) {
        std::string msg;
        RollbackTransaction(txId, engine, msg);
        recoveryLogs.push_back("Recovery: " + msg);
    }

    PruneJournal();
    return recoveryLogs;
}

std::vector<TransactionEntry> TransactionJournal::GetActiveTransactions() const {
    std::lock_guard<std::mutex> lock(journalMutex_);
    std::vector<TransactionEntry> active;
    for (const auto& e : entries_) {
        if (e.status == TransactionStatus::Verified || e.status == TransactionStatus::Applied || e.status == TransactionStatus::Pending) {
            active.push_back(e);
        }
    }
    return active;
}

std::vector<TransactionEntry> TransactionJournal::GetAllTransactions() const {
    std::lock_guard<std::mutex> lock(journalMutex_);
    return entries_;
}

bool TransactionJournal::HasActiveTransactions() const {
    std::lock_guard<std::mutex> lock(journalMutex_);
    for (const auto& e : entries_) {
        if (e.status == TransactionStatus::Verified || e.status == TransactionStatus::Applied || e.status == TransactionStatus::Pending) {
            return true;
        }
    }
    return false;
}

void TransactionJournal::PruneJournal() {
    std::lock_guard<std::mutex> lock(journalMutex_);
    std::vector<TransactionEntry> kept;
    for (const auto& e : entries_) {
        // Keep active and recently rolled back entries
        if (e.status == TransactionStatus::Verified || e.status == TransactionStatus::Applied || e.status == TransactionStatus::Pending) {
            kept.push_back(e);
        }
    }
    entries_ = std::move(kept);
    PersistJournal();
}

void TransactionJournal::PersistJournal() {
    std::ofstream out(journalPath_, std::ios::trunc);
    if (!out.is_open()) return;

    for (const auto& e : entries_) {
        out << e.transactionId << "|"
            << e.pid << "|"
            << e.processName << "|"
            << e.originalPriority << "|"
            << (e.originalEcoQoS ? "1" : "0") << "|"
            << e.modifiedPriority << "|"
            << (e.modifiedEcoQoS ? "1" : "0") << "|"
            << static_cast<int>(e.status) << "|"
            << e.timestamp << "|"
            << e.reason << "\n";
    }
}

void TransactionJournal::LoadJournal() {
    std::ifstream in(journalPath_);
    if (!in.is_open()) return;

    entries_.clear();
    std::string line;
    while (std::getline(in, line)) {
        if (line.empty()) continue;
        std::stringstream ss(line);
        std::string token;
        std::vector<std::string> parts;
        while (std::getline(ss, token, '|')) {
            parts.push_back(token);
        }

        if (parts.size() >= 10) {
            TransactionEntry e;
            e.transactionId = parts[0];
            e.pid = std::stoul(parts[1]);
            e.processName = parts[2];
            e.originalPriority = std::stoul(parts[3]);
            e.originalEcoQoS = (parts[4] == "1");
            e.modifiedPriority = std::stoul(parts[5]);
            e.modifiedEcoQoS = (parts[6] == "1");
            e.status = static_cast<TransactionStatus>(std::stoi(parts[7]));
            e.timestamp = parts[8];
            e.reason = parts[9];
            entries_.push_back(e);
        }
    }
}

} // namespace OptiWin
