/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: OptiWinCore.hpp
 * 
 * Core architectural types, interfaces, safety invariants, and enumeration definitions.
 * Target: Windows 10 / Windows 11 x64 (MSVC / MinGW-w64 C++20)
 * 
 * Safety Principle:
 * MEASURE -> ANALYZE -> IDENTIFY BOTTLENECK -> DETERMINE SAFE ACTION -> APPLY MINIMAL CHANGE -> VERIFY -> KEEP OR ROLLBACK
 */

#pragma once

#include <string>
#include <vector>
#include <memory>
#include <chrono>
#include <cstdint>
#include <optional>
#include <functional>

#if defined(_WIN32) || defined(__CYGWIN__) || defined(__MINGW32__)
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#ifndef NOMINMAX
#define NOMINMAX
#endif
#include <windows.h>
#include <psapi.h>
#include <tlhelp32.h>
#else
// Non-Windows stub definitions for cross-platform unit testing
typedef unsigned long DWORD;
typedef void* HANDLE;
typedef int BOOL;
#define FALSE 0
#define TRUE 1
#endif

namespace OptiWin {

constexpr const char* APP_NAME = "OptiWinX";
constexpr const char* APP_VERSION = "2.0.0";
constexpr const char* APP_BUILD_TARGET = "x64 Native (Windows 10/11)";

// Elevation state (Section 4)
enum class ElevationState {
    Standard,
    Administrator
};

// Process Classification (Section 7)
enum class ProcessCategory {
    CriticalSystem,
    WindowsCore,
    Security,
    DriverHardware,
    ActiveGame,
    ForegroundApp,
    BackgroundApp,
    Launcher,
    Utility,
    Unknown
};

// Bottleneck Diagnosis Classification (Section 10)
enum class BottleneckType {
    CpuBound,
    GpuBound,
    VramPressure,
    RamPressure,
    StorageBound,
    Mixed,
    Balanced,
    Unknown
};

// Risk Levels (Section 25)
enum class RiskLevel {
    Low,
    Medium,
    High
};

// Gaming Mode Safety Policies (Section 16)
enum class SafetyPolicy {
    Safe,       // Only very low-risk modifications
    Balanced,   // Allows approved process priority and EcoQoS changes
    Custom      // User-selected categories
};

// Memory Pressure Diagnostics (Section 6)
enum class MemoryPressureState {
    Nominal,          // 0 - 40
    LowPressure,      // 40 - 60
    ModeratePressure, // 60 - 75
    HighPressure,     // 75 - 90
    CriticalPressure  // 90 - 100
};

// Action transaction status (Section 14 & 15)
enum class TransactionStatus {
    Pending,
    Applied,
    Verified,
    Failed,
    RolledBack,
    NoLongerExists
};

// Telemetry & Hardware Data
struct CpuInfo {
    std::string name = "Unknown CPU";
    std::string architecture = "x64";
    uint32_t physicalCores = 0;
    uint32_t logicalProcessors = 0;
    uint32_t baseFrequencyMhz = 0;
    uint32_t currentFrequencyMhz = 0;
    std::string cacheInfo = "Unknown";
    bool instructionSetAvx2 = false;
    bool instructionSetAvx512 = false;
};

struct RamInfo {
    uint64_t totalPhysicalBytes = 0;
    uint64_t availablePhysicalBytes = 0;
    uint64_t totalCommitLimitBytes = 0;
    uint64_t currentCommitBytes = 0;
    uint32_t memoryLoadPercent = 0;
    uint64_t pageFileBytes = 0;
    bool isPressureDetected = false;
};

struct GpuAdapterInfo {
    std::string name = "Unknown GPU";
    std::string vendor = "Unknown";
    uint64_t dedicatedVramBytes = 0;
    uint64_t sharedMemoryBytes = 0;
    uint64_t memoryBudgetBytes = 0;
    std::string driverVersion = "Unavailable";
    bool isPrimary = false;
};

struct OsInfo {
    std::string osName = "Windows";
    uint32_t majorVersion = 10;
    uint32_t minorVersion = 0;
    uint32_t buildNumber = 0;
    std::string displayVersion = "";
    std::string architecture = "64-bit";
    ElevationState elevation = ElevationState::Standard;
    bool isWindows11 = false;
    bool supportsEcoQoS = false; // Windows 11 Build 22000+
};

struct StorageDriveInfo {
    std::string driveLetter;
    std::string model;
    std::string type; // SSD, NVMe, HDD, Unknown
    uint64_t totalBytes = 0;
    uint64_t freeBytes = 0;
};

struct HardwareProfile {
    CpuInfo cpu;
    RamInfo ram;
    std::vector<GpuAdapterInfo> gpus;
    OsInfo os;
    std::vector<StorageDriveInfo> drives;
    std::string detectionTimestamp;
};

// Performance Telemetry
struct SystemMetrics {
    double cpuUsagePercent = 0.0;
    std::vector<double> perCoreUsage;
    double ramUsagePercent = 0.0;
    double commitUsagePercent = 0.0;
    uint64_t availableRamMb = 0;
    double gpuUsagePercent = 0.0;
    uint64_t vramUsedMb = 0;
    uint64_t vramTotalMb = 0;
    double hardPageFaultsPerSec = 0.0;
    uint32_t memoryPressureScore = 0; // 0 - 100 normalized
    MemoryPressureState pressureState = MemoryPressureState::Nominal;
    std::string timestamp;
};

// Bottleneck Diagnosis
struct BottleneckDiagnosis {
    BottleneckType type = BottleneckType::Unknown;
    uint32_t confidencePercent = 0;
    std::string supportingReason;
    std::string limitations;
    std::string timestamp;
};

// Process Information (Section 7)
struct ProcessInfo {
    uint32_t pid = 0;
    std::string name;
    std::string path;
    ProcessCategory category = ProcessCategory::Unknown;
    double cpuPercent = 0.0;
    uint64_t workingSetBytes = 0;
    uint64_t privateBytes = 0;
    uint32_t priorityClass = 0; // e.g. NORMAL_PRIORITY_CLASS
    std::string priorityName = "NORMAL";
    bool ecoQoSEnabled = false;
    bool isElevated = false;
    bool isProtected = false;
    bool isExcluded = false;
};

// Transaction Entry (Section 12, 14, 15)
struct TransactionEntry {
    std::string transactionId;
    uint32_t pid = 0;
    std::string processName;
    uint32_t originalPriority = 0;
    uint32_t modifiedPriority = 0;
    bool originalEcoQoS = false;
    bool modifiedEcoQoS = false;
    std::string reason;
    RiskLevel risk = RiskLevel::Low;
    TransactionStatus status = TransactionStatus::Pending;
    std::string timestamp;
    std::string verificationResult;
};

// Log Entry (Section 24)
struct LogEntry {
    std::string timestamp;
    std::string action;
    std::string processName;
    uint32_t pid = 0;
    std::string previousState;
    std::string newState;
    std::string reason;
    RiskLevel risk = RiskLevel::Low;
    std::string verification;
    std::string rollbackResult;
};

// Utility string conversions
inline const char* ToString(ProcessCategory cat) {
    switch (cat) {
        case ProcessCategory::CriticalSystem: return "Critical System";
        case ProcessCategory::WindowsCore:    return "Windows Core";
        case ProcessCategory::Security:       return "Security Software";
        case ProcessCategory::DriverHardware: return "Driver / Hardware Service";
        case ProcessCategory::ActiveGame:     return "Active Game";
        case ProcessCategory::ForegroundApp:  return "Foreground Application";
        case ProcessCategory::BackgroundApp:  return "Background Application";
        case ProcessCategory::Launcher:       return "Game Launcher";
        case ProcessCategory::Utility:        return "System Utility";
        default:                              return "Unknown";
    }
}

inline const char* ToString(BottleneckType type) {
    switch (type) {
        case BottleneckType::CpuBound:      return "CPU-BOUND";
        case BottleneckType::GpuBound:      return "GPU-BOUND";
        case BottleneckType::VramPressure:  return "VRAM-PRESSURE";
        case BottleneckType::RamPressure:   return "RAM-PRESSURE";
        case BottleneckType::StorageBound:  return "STORAGE-BOUND";
        case BottleneckType::Mixed:         return "MIXED";
        case BottleneckType::Balanced:      return "BALANCED";
        default:                            return "UNKNOWN";
    }
}

inline const char* ToString(RiskLevel risk) {
    switch (risk) {
        case RiskLevel::Low:    return "LOW";
        case RiskLevel::Medium: return "MEDIUM";
        case RiskLevel::High:   return "HIGH";
        default:                return "UNKNOWN";
    }
}

inline const char* ToString(MemoryPressureState state) {
    switch (state) {
        case MemoryPressureState::Nominal:          return "NOMINAL";
        case MemoryPressureState::LowPressure:      return "LOW PRESSURE";
        case MemoryPressureState::ModeratePressure: return "MODERATE PRESSURE";
        case MemoryPressureState::HighPressure:     return "HIGH PRESSURE";
        case MemoryPressureState::CriticalPressure: return "CRITICAL PRESSURE";
        default:                                    return "UNKNOWN";
    }
}

} // namespace OptiWin
