/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: MemoryManager.hpp
 * 
 * Adaptive Memory Pressure Engine & Safe Working-Set Management (Section 6 & Section 9)
 * Strict evidence-based memory handling, zero snake-oil RAM purging.
 */

#pragma once

#include "OptiWinCore.hpp"
#include <unordered_map>
#include <chrono>

namespace OptiWin {

struct TrimResult {
    bool attempted = false;
    bool success = false;
    uint64_t bytesBefore = 0;
    uint64_t bytesAfter = 0;
    int64_t bytesRecovered = 0;
    std::string message;
};

class MemoryManager {
public:
    MemoryManager();
    ~MemoryManager() = default;

    // Calculate normalized pressure score [0 - 100]
    uint32_t CalculatePressureScore(const RamInfo& ram, double faultRatePerSec) const;
    MemoryPressureState GetPressureState(uint32_t score) const;

    // Safe, targeted working-set trimming (Section 9)
    // Only applied to eligible background processes under sustained pressure
    TrimResult RequestTargetedTrim(uint32_t pid, const std::string& processName, ProcessCategory category, uint32_t currentPressureScore);

    // Set cooldown in seconds (default 300s = 5 minutes)
    void SetTrimCooldownSeconds(uint32_t seconds);

    // Diagnostics rationale
    std::string ExplainPressureState(MemoryPressureState state, uint32_t score) const;

private:
    uint32_t trimCooldownSeconds_ = 300;
    // Track last trim time per PID to prevent thrashing
    std::unordered_map<uint32_t, std::chrono::steady_clock::time_point> lastTrimTimes_;
};

} // namespace OptiWin
