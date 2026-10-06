/**
 * OptiWinX Native Windows Optimizer v2.0
 * Source: MemoryManager.cpp
 * 
 * Adaptive Memory Pressure Engine & Safe Working-Set Management Implementation
 */

#include "MemoryManager.hpp"
#include <algorithm>
#include <sstream>
#include <iomanip>

#if defined(_WIN32) || defined(__CYGWIN__) || defined(__MINGW32__)
#include <windows.h>
#include <psapi.h>
#endif

namespace OptiWin {

MemoryManager::MemoryManager() : trimCooldownSeconds_(300) {
}

void MemoryManager::SetTrimCooldownSeconds(uint32_t seconds) {
    trimCooldownSeconds_ = std::max<uint32_t>(30, seconds);
}

uint32_t MemoryManager::CalculatePressureScore(const RamInfo& ram, double faultRatePerSec) const {
    double physicalRatio = (ram.totalPhysicalBytes > 0)
        ? (1.0 - (static_cast<double>(ram.availablePhysicalBytes) / static_cast<double>(ram.totalPhysicalBytes)))
        : (static_cast<double>(ram.memoryLoadPercent) / 100.0);

    double commitRatio = (ram.totalCommitLimitBytes > 0)
        ? (static_cast<double>(ram.currentCommitBytes) / static_cast<double>(ram.totalCommitLimitBytes))
        : physicalRatio;

    // Bounded input weighting:
    // Physical RAM load: 45%
    // Commit charge: 40%
    // Page fault activity: 15% (clamped to [0, 15])
    double physicalComponent = std::clamp(physicalRatio * 100.0, 0.0, 100.0) * 0.45;
    double commitComponent = std::clamp(commitRatio * 100.0, 0.0, 100.0) * 0.40;
    double faultComponent = std::clamp(faultRatePerSec * 3.0, 0.0, 15.0);

    double total = physicalComponent + commitComponent + faultComponent;
    return static_cast<uint32_t>(std::clamp(total, 0.0, 100.0));
}

MemoryPressureState MemoryManager::GetPressureState(uint32_t score) const {
    if (score < 40) return MemoryPressureState::Nominal;
    if (score < 60) return MemoryPressureState::LowPressure;
    if (score < 75) return MemoryPressureState::ModeratePressure;
    if (score < 90) return MemoryPressureState::HighPressure;
    return MemoryPressureState::CriticalPressure;
}

std::string MemoryManager::ExplainPressureState(MemoryPressureState state, uint32_t score) const {
    std::ostringstream ss;
    ss << "Score: " << score << "/100 [" << ToString(state) << "]. ";
    switch (state) {
        case MemoryPressureState::Nominal:
            ss << "Operating nominally. Windows standby cache is operating efficiently. No intervention justified.";
            break;
        case MemoryPressureState::LowPressure:
            ss << "Normal multi-tasking load. Adequate headroom in physical RAM and commit charge.";
            break;
        case MemoryPressureState::ModeratePressure:
            ss << "Elevated memory utilization. Windows paging subsystem managing working sets normally.";
            break;
        case MemoryPressureState::HighPressure:
            ss << "Sustained high memory load. Background applications may be audited for unnecessary working-set retention.";
            break;
        case MemoryPressureState::CriticalPressure:
            ss << "Severe memory pressure. Risk of commit exhaustion and heavy swapping. Targeted background trim recommended.";
            break;
    }
    return ss.str();
}

TrimResult MemoryManager::RequestTargetedTrim(uint32_t pid, const std::string& processName, ProcessCategory category, uint32_t currentPressureScore) {
    TrimResult res;
    res.attempted = false;
    res.success = false;

    // Safety Invariant: NEVER trim games, critical systems, security, or drivers
    if (category != ProcessCategory::BackgroundApp && category != ProcessCategory::Utility) {
        res.message = "Refused: Process category '" + std::string(ToString(category)) + "' is protected from trimming.";
        return res;
    }

    // Safety Invariant: Require sustained pressure (Score >= 75)
    if (currentPressureScore < 75) {
        res.message = "Refused: Memory pressure score (" + std::to_string(currentPressureScore) + "/100) is below the threshold of 75. Standby RAM is beneficial.";
        return res;
    }

    // Cooldown check
    auto now = std::chrono::steady_clock::now();
    auto it = lastTrimTimes_.find(pid);
    if (it != lastTrimTimes_.end()) {
        auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now - it->second).count();
        if (elapsed < trimCooldownSeconds_) {
            res.message = "Cooldown active: PID " + std::to_string(pid) + " trimmed " + std::to_string(elapsed) + "s ago (limit: " + std::to_string(trimCooldownSeconds_) + "s).";
            return res;
        }
    }

    res.attempted = true;

#if defined(_WIN32) || defined(__CYGWIN__) || defined(__MINGW32__)
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_SET_QUOTA, FALSE, pid);
    if (!hProcess) {
        res.message = "Access denied or process terminated (PID " + std::to_string(pid) + ").";
        return res;
    }

    PROCESS_MEMORY_COUNTERS_EX pmcBefore;
    if (GetProcessMemoryInfo(hProcess, (PROCESS_MEMORY_COUNTERS*)&pmcBefore, sizeof(pmcBefore))) {
        res.bytesBefore = pmcBefore.WorkingSetSize;
    }

    // Targeted trim via EmptyWorkingSet
    BOOL trimOk = EmptyWorkingSet(hProcess);

    PROCESS_MEMORY_COUNTERS_EX pmcAfter;
    if (trimOk && GetProcessMemoryInfo(hProcess, (PROCESS_MEMORY_COUNTERS*)&pmcAfter, sizeof(pmcAfter))) {
        res.bytesAfter = pmcAfter.WorkingSetSize;
        res.bytesRecovered = static_cast<int64_t>(res.bytesBefore) - static_cast<int64_t>(res.bytesAfter);
        res.success = true;
        lastTrimTimes_[pid] = now;

        if (res.bytesRecovered > 1024 * 1024) { // > 1 MB
            double mb = static_cast<double>(res.bytesRecovered) / (1024.0 * 1024.0);
            std::ostringstream ss;
            ss << "Trimmed " << std::fixed << std::setprecision(1) << mb << " MB from " << processName << " (PID " << pid << ").";
            res.message = ss.str();
        } else {
            res.message = "No measurable improvement detected (< 1 MB change).";
        }
    } else {
        res.message = "EmptyWorkingSet failed (Error code: " + std::to_string(GetLastError()) + ").";
    }

    CloseHandle(hProcess);
#else
    res.bytesBefore = 250 * 1024 * 1024;
    res.bytesAfter = 90 * 1024 * 1024;
    res.bytesRecovered = res.bytesBefore - res.bytesAfter;
    res.success = true;
    lastTrimTimes_[pid] = now;
    res.message = "Simulated verified trim of 160.0 MB for " + processName;
#endif

    return res;
}

} // namespace OptiWin
