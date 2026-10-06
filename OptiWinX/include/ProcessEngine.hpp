/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: ProcessEngine.hpp
 * 
 * Process Intelligence Engine & Safe Throttling / Priority Management (Section 7, 8, 13)
 * Toolhelp32 enumeration, strict exclusions, EcoQoS, and verified priority adjustments.
 */

#pragma once

#include "OptiWinCore.hpp"
#include <string>
#include <vector>
#include <unordered_set>
#include <unordered_map>
#include <memory>

namespace OptiWin {

struct PriorityChangeResult {
    bool attempted = false;
    bool success = false;
    uint32_t originalPriority = 0;
    uint32_t targetPriority = 0;
    uint32_t verifiedPriority = 0;
    std::string message;
};

struct EcoQoSChangeResult {
    bool attempted = false;
    bool success = false;
    bool originalEcoQoS = false;
    bool targetEcoQoS = false;
    bool verifiedEcoQoS = false;
    std::string message;
};

class ProcessEngine {
public:
    ProcessEngine();
    ~ProcessEngine() = default;

    // Enumerate and classify all running processes
    std::vector<ProcessInfo> EnumerateProcesses();

    // Query specific process by PID
    std::optional<ProcessInfo> QueryProcess(uint32_t pid);

    // Classify executable name into category
    ProcessCategory ClassifyProcess(const std::string& exeName, bool isForeground, bool isGameSuspect) const;

    // Check if process is strictly protected or on exclusion list
    bool IsProcessExcluded(const std::string& exeName, ProcessCategory category) const;

    // Safe Process Priority Management (Section 13)
    PriorityChangeResult SetProcessPriority(uint32_t pid, uint32_t newPriorityClass);

    // Safe EcoQoS Power Management (Section 8)
    EcoQoSChangeResult SetProcessEcoQoS(uint32_t pid, bool enable);

    // Query foreground process PID
    static uint32_t GetForegroundProcessId();

    // Exclusions management
    void AddCustomExclusion(const std::string& exeName);
    void RemoveCustomExclusion(const std::string& exeName);
    const std::unordered_set<std::string>& GetExclusions() const { return exclusions_; }

    // Known game list management
    void AddKnownGame(const std::string& exeName);
    bool IsKnownGame(const std::string& exeName) const;

    // Human-readable priority string converter
    static std::string PriorityToString(uint32_t priorityClass);
    static uint32_t StringToPriority(const std::string& name);

private:
    void InitializeKnownDatabases();

    std::unordered_set<std::string> criticalSystemExes_;
    std::unordered_set<std::string> windowsCoreExes_;
    std::unordered_set<std::string> securityExes_;
    std::unordered_set<std::string> driverExes_;
    std::unordered_set<std::string> launcherExes_;
    std::unordered_set<std::string> knownGames_;
    std::unordered_set<std::string> exclusions_;

    // CPU tracking cache per PID
    struct CpuSample {
        uint64_t fileTime = 0;
        std::chrono::steady_clock::time_point sampleTime;
    };
    std::unordered_map<uint32_t, CpuSample> processCpuHistory_;
};

} // namespace OptiWin
