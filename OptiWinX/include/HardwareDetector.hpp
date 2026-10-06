/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: HardwareDetector.hpp
 * 
 * Hardware Auto-Detection Engine (Section 3 & Section 4)
 * Multi-source telemetry via Win32, CPUID, DXGI, and NTDLL.
 */

#pragma once

#include "OptiWinCore.hpp"
#include <string>
#include <vector>

namespace OptiWin {

class HardwareDetector {
public:
    HardwareDetector() = default;
    ~HardwareDetector() = default;

    // Run complete system inspection
    HardwareProfile DetectAll();

    // Individual sub-detectors
    CpuInfo DetectCpu();
    RamInfo DetectRam();
    std::vector<GpuAdapterInfo> DetectGpus();
    OsInfo DetectOs();
    std::vector<StorageDriveInfo> DetectStorage();

    // Elevation & privilege queries (Section 4)
    static ElevationState CheckElevation();
    static bool IsAdministrator();

    // Format summary for CLI and diagnostics
    static std::string FormatSummary(const HardwareProfile& profile);

private:
    std::string QueryCpuBrandString();
    void QueryCpuTopology(CpuInfo& info);
    void QueryCpuFeatures(CpuInfo& info);
};

} // namespace OptiWin
