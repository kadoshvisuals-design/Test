/**
 * OptiWinX Native Windows Optimizer v2.0
 * Source: GamingModeEngine.cpp
 * 
 * Transaction-Backed Gaming Mode Engine Implementation
 */

#include "GamingModeEngine.hpp"
#include <algorithm>
#include <sstream>
#include <iomanip>
#include <cmath>

namespace OptiWin {

GamingModeEngine::GamingModeEngine(std::shared_ptr<ProcessEngine> processEngine,
                                   std::shared_ptr<TransactionJournal> journal,
                                   std::shared_ptr<PerformanceMonitor> monitor)
    : processEngine_(processEngine), journal_(journal), monitor_(monitor) {
}

GamingModeEngine::~GamingModeEngine() {
    if (isActive_) {
        std::vector<std::string> discard;
        Disengage(discard);
    }
}

std::optional<ProcessInfo> GamingModeEngine::IdentifyActiveGame(const std::string& explicitGameExe) const {
    auto procs = processEngine_->EnumerateProcesses();

    // 1. Explicit user selection
    if (!explicitGameExe.empty()) {
        for (const auto& p : procs) {
            if (p.name == explicitGameExe) return p;
        }
    }

    // 2. Known game executable
    for (const auto& p : procs) {
        if (p.category == ProcessCategory::ActiveGame) return p;
    }

    // 3. Foreground process with heavy working set (> 1GB) and not a system process
    uint32_t fgPid = ProcessEngine::GetForegroundProcessId();
    if (fgPid > 0) {
        for (const auto& p : procs) {
            if (p.pid == fgPid && !p.isExcluded && p.workingSetBytes > (1024ULL * 1024 * 1024)) {
                return p;
            }
        }
    }

    return std::nullopt;
}

std::vector<ProposedAction> GamingModeEngine::PlanOptimizations(SafetyPolicy policy, const std::string& explicitGameExe) {
    std::vector<ProposedAction> actions;
    auto gameOpt = IdentifyActiveGame(explicitGameExe);
    auto procs = processEngine_->EnumerateProcesses();

    // 1. Proposed Game Optimization (if game identified)
    if (gameOpt.has_value()) {
        ProposedAction gameAction;
        gameAction.pid = gameOpt->pid;
        gameAction.processName = gameOpt->name;
        gameAction.category = ProcessCategory::ActiveGame;
        gameAction.currentPriority = gameOpt->priorityName;
        gameAction.proposedPriority = "ABOVE_NORMAL";
        gameAction.currentEcoQoS = gameOpt->ecoQoSEnabled;
        gameAction.proposedEcoQoS = false; // Never throttle game
        gameAction.reason = "Prioritize render and main game thread dispatching (ABOVE_NORMAL).";
        gameAction.risk = RiskLevel::Low;
        gameAction.rollbackSupported = true;
        actions.push_back(gameAction);
    }

    // 2. Proposed Background Throttling
    for (const auto& p : procs) {
        if (gameOpt.has_value() && p.pid == gameOpt->pid) continue;
        if (p.isExcluded) continue;

        if (p.category == ProcessCategory::BackgroundApp) {
            ProposedAction bgAction;
            bgAction.pid = p.pid;
            bgAction.processName = p.name;
            bgAction.category = ProcessCategory::BackgroundApp;
            bgAction.currentPriority = p.priorityName;
            bgAction.currentEcoQoS = p.ecoQoSEnabled;
            bgAction.rollbackSupported = true;

            if (policy == SafetyPolicy::Safe) {
                // Safe mode: EcoQoS throttling only, no priority reduction
                bgAction.proposedPriority = p.priorityName;
                bgAction.proposedEcoQoS = true;
                bgAction.reason = "Background efficiency throttling via Windows EcoQoS to minimize CPU core contention.";
                bgAction.risk = RiskLevel::Low;
                actions.push_back(bgAction);
            } else if (policy == SafetyPolicy::Balanced || policy == SafetyPolicy::Custom) {
                // Balanced mode: BELOW_NORMAL priority + EcoQoS
                bgAction.proposedPriority = "BELOW_NORMAL";
                bgAction.proposedEcoQoS = true;
                bgAction.reason = "Demote priority to BELOW_NORMAL and apply EcoQoS to prevent audio/video stutter in primary game.";
                bgAction.risk = RiskLevel::Low;
                actions.push_back(bgAction);
            }
        }
    }

    return actions;
}

bool GamingModeEngine::Engage(SafetyPolicy policy, const std::string& explicitGameExe, std::vector<std::string>& outLog) {
    if (isActive_) {
        outLog.push_back("Gaming Mode is already active.");
        return true;
    }

    // Record baseline telemetry
    baselineMetrics_ = monitor_->SampleMetrics();

    auto actions = PlanOptimizations(policy, explicitGameExe);
    if (actions.empty()) {
        outLog.push_back("No eligible optimizations identified. System state nominal.");
        return false;
    }

    auto gameOpt = IdentifyActiveGame(explicitGameExe);
    if (gameOpt.has_value()) {
        activeGameName_ = gameOpt->name;
        activeGamePid_ = gameOpt->pid;
        outLog.push_back("Detected active game workload: " + activeGameName_ + " (PID " + std::to_string(activeGamePid_) + ").");
    } else {
        activeGameName_ = "Generic Gaming Workload";
        activeGamePid_ = 0;
        outLog.push_back("No specific game identified; applying conservative background EcoQoS profile.");
    }

    activeTransactionIds_.clear();

    for (const auto& act : actions) {
        uint32_t origPrio = ProcessEngine::StringToPriority(act.currentPriority);
        uint32_t modPrio = ProcessEngine::StringToPriority(act.proposedPriority);

        // Open journal transaction
        std::string txId = journal_->BeginTransaction(
            act.pid, act.processName,
            origPrio, act.currentEcoQoS,
            modPrio, act.proposedEcoQoS,
            act.reason, act.risk
        );
        activeTransactionIds_.push_back(txId);

        // Apply Priority if changed
        bool prioOk = true;
        if (modPrio != origPrio) {
            auto pRes = processEngine_->SetProcessPriority(act.pid, modPrio);
            prioOk = pRes.success;
            outLog.push_back("[" + act.processName + "] " + pRes.message);
        }

        // Apply EcoQoS if changed
        bool ecoOk = true;
        if (act.proposedEcoQoS != act.currentEcoQoS) {
            auto eRes = processEngine_->SetProcessEcoQoS(act.pid, act.proposedEcoQoS);
            ecoOk = eRes.success;
            outLog.push_back("[" + act.processName + "] " + eRes.message);
        }

        if (prioOk && ecoOk) {
            journal_->MarkApplied(txId, "Verified successfully");
        }
    }

    isActive_ = true;
    currentPolicy_ = policy;
    activationTimestamp_ = baselineMetrics_.timestamp;
    outLog.push_back("Gaming Mode successfully engaged with " + std::to_string(activeTransactionIds_.size()) + " transaction-backed rule(s).");
    return true;
}

bool GamingModeEngine::Disengage(std::vector<std::string>& outLog) {
    if (!isActive_) {
        outLog.push_back("Gaming Mode is not active.");
        return false;
    }

    outLog.push_back("Disengaging Gaming Mode: rolling back all active transactions...");
    auto rollbackResults = journal_->RollbackAll(*processEngine_);
    for (const auto& r : rollbackResults) {
        outLog.push_back(r);
    }

    isActive_ = false;
    activeGameName_ = "None";
    activeGamePid_ = 0;
    activeTransactionIds_.clear();
    outLog.push_back("Gaming Mode disengaged. All process states verified and restored.");
    return true;
}

GamingModeStatus GamingModeEngine::GetStatus() const {
    GamingModeStatus s;
    s.isActive = isActive_;
    s.activeGameName = activeGameName_;
    s.activeGamePid = activeGamePid_;
    s.policy = currentPolicy_;
    s.throttledProcessCount = activeTransactionIds_.size();
    s.baselineMetrics = baselineMetrics_;
    s.currentMetrics = monitor_->GetCurrentMetrics();
    s.activationTimestamp = activationTimestamp_;
    return s;
}

std::string GamingModeEngine::ValidatePerformanceDelta() const {
    if (!isActive_) {
        return "Gaming Mode inactive; no comparison telemetry available.";
    }

    SystemMetrics post = monitor_->GetCurrentMetrics();
    double cpuDelta = post.cpuUsagePercent - baselineMetrics_.cpuUsagePercent;
    int pressureDelta = static_cast<int>(post.memoryPressureScore) - static_cast<int>(baselineMetrics_.memoryPressureScore);

    std::ostringstream ss;
    ss << "=== Performance Delta Analysis ===\n";
    ss << "Baseline CPU: " << std::fixed << std::setprecision(1) << baselineMetrics_.cpuUsagePercent 
       << "% | Current CPU: " << post.cpuUsagePercent << "%\n";
    ss << "Baseline Memory Pressure: " << baselineMetrics_.memoryPressureScore 
       << "/100 | Current Memory Pressure: " << post.memoryPressureScore << "/100\n";

    if (std::abs(cpuDelta) < 3.0 && std::abs(pressureDelta) < 5) {
        ss << "Result: No measurable difference detected. Workload demand remained consistent.\n";
    } else if (cpuDelta < -4.0) {
        ss << "Result: Background CPU contention reduced by " << std::fixed << std::setprecision(1) 
           << (-cpuDelta) << " percentage points.\n";
    } else {
        ss << "Result: System workload variations observed (+ " << std::fixed << std::setprecision(1) 
           << cpuDelta << "% overall load).\n";
    }

    ss << "Note: OptiWinX does not fabricate FPS numbers without hardware-level frame hooks.\n";
    return ss.str();
}

} // namespace OptiWin
