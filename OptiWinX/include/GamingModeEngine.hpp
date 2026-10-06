/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: GamingModeEngine.hpp
 * 
 * Transaction-Backed Gaming Mode Engine (Section 12 & Section 16)
 * Real foreground detection, conservative background throttling, and verified auto-rollback.
 */

#pragma once

#include "OptiWinCore.hpp"
#include "ProcessEngine.hpp"
#include "TransactionJournal.hpp"
#include "PerformanceMonitor.hpp"
#include <string>
#include <vector>
#include <memory>
#include <optional>

namespace OptiWin {

struct ProposedAction {
    uint32_t pid = 0;
    std::string processName;
    ProcessCategory category;
    std::string currentPriority;
    std::string proposedPriority;
    bool currentEcoQoS = false;
    bool proposedEcoQoS = false;
    std::string reason;
    RiskLevel risk = RiskLevel::Low;
    bool rollbackSupported = true;
};

struct GamingModeStatus {
    bool isActive = false;
    std::string activeGameName = "None";
    uint32_t activeGamePid = 0;
    SafetyPolicy policy = SafetyPolicy::Safe;
    size_t throttledProcessCount = 0;
    SystemMetrics baselineMetrics;
    SystemMetrics currentMetrics;
    std::string activationTimestamp;
};

class GamingModeEngine {
public:
    GamingModeEngine(std::shared_ptr<ProcessEngine> processEngine,
                     std::shared_ptr<TransactionJournal> journal,
                     std::shared_ptr<PerformanceMonitor> monitor);
    ~GamingModeEngine();

    // Dry-run mode: Analyzes and returns proposed actions without making ANY system modifications (Section 19)
    std::vector<ProposedAction> PlanOptimizations(SafetyPolicy policy, const std::string& explicitGameExe = "");

    // Engage Gaming Mode with real system modifications backed by journal
    bool Engage(SafetyPolicy policy, const std::string& explicitGameExe, std::vector<std::string>& outLog);

    // Disengage Gaming Mode and restore all processes to original state
    bool Disengage(std::vector<std::string>& outLog);

    // Query active status
    GamingModeStatus GetStatus() const;

    // Detect likely active game
    std::optional<ProcessInfo> IdentifyActiveGame(const std::string& explicitGameExe = "") const;

    // Compare before and after metrics (Section 11)
    std::string ValidatePerformanceDelta() const;

private:
    std::shared_ptr<ProcessEngine> processEngine_;
    std::shared_ptr<TransactionJournal> journal_;
    std::shared_ptr<PerformanceMonitor> monitor_;

    bool isActive_ = false;
    SafetyPolicy currentPolicy_ = SafetyPolicy::Safe;
    std::string activeGameName_;
    uint32_t activeGamePid_ = 0;
    std::string activationTimestamp_;
    SystemMetrics baselineMetrics_;
    std::vector<std::string> activeTransactionIds_;
};

} // namespace OptiWin
