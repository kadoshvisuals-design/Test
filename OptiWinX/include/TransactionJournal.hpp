/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: TransactionJournal.hpp
 * 
 * Transaction Journal & Crash Recovery Engine (Section 14 & Section 15)
 * Atomicity, audit logging, crash recovery, and verified rollback.
 */

#pragma once

#include "OptiWinCore.hpp"
#include <vector>
#include <string>
#include <mutex>

namespace OptiWin {

class TransactionJournal {
public:
    explicit TransactionJournal(const std::string& journalFilePath = "optiwin_recovery.journal");
    ~TransactionJournal();

    // Create a new pending transaction
    std::string BeginTransaction(uint32_t pid, const std::string& processName,
                                uint32_t origPriority, bool origEcoQoS,
                                uint32_t modPriority, bool modEcoQoS,
                                const std::string& reason, RiskLevel risk);

    // Record verified completion of modification
    void MarkApplied(const std::string& transactionId, const std::string& verificationMsg);

    // Rollback all active transactions or a specific one
    std::vector<std::string> RollbackAll(class ProcessEngine& engine);
    bool RollbackTransaction(const std::string& transactionId, class ProcessEngine& engine, std::string& outMessage);

    // Detect and recover incomplete transactions from prior crashed session
    std::vector<std::string> RecoverCrashedSession(class ProcessEngine& engine);

    // Query active/completed transactions
    std::vector<TransactionEntry> GetActiveTransactions() const;
    std::vector<TransactionEntry> GetAllTransactions() const;
    bool HasActiveTransactions() const;

    // Clear completed transactions from journal file
    void PruneJournal();

private:
    void PersistJournal();
    void LoadJournal();

    std::string journalPath_;
    mutable std::mutex journalMutex_;
    std::vector<TransactionEntry> entries_;
};

} // namespace OptiWin
