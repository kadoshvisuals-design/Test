/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: Diagnostics.hpp
 * 
 * Extended System Diagnostics Engine (Section 10, 11, 20)
 * Aggregates all subsystems into structured telemetry reports.
 */

#pragma once

#include "OptiWinCore.hpp"
#include "HardwareDetector.hpp"
#include "PerformanceMonitor.hpp"
#include "MemoryManager.hpp"
#include "ProcessEngine.hpp"
#include "BottleneckAnalyzer.hpp"
#include "TransactionJournal.hpp"
#include <string>
#include <memory>

namespace OptiWin {

class DiagnosticsEngine {
public:
    DiagnosticsEngine(std::shared_ptr<HardwareDetector> hw,
                      std::shared_ptr<PerformanceMonitor> monitor,
                      std::shared_ptr<MemoryManager> mem,
                      std::shared_ptr<ProcessEngine> proc,
                      std::shared_ptr<BottleneckAnalyzer> bottleneck,
                      std::shared_ptr<TransactionJournal> journal);
    ~DiagnosticsEngine() = default;

    // Generate comprehensive text diagnostic report
    std::string GenerateFullReport();

    // Generate machine-readable JSON report
    std::string GenerateJsonReport();

private:
    std::shared_ptr<HardwareDetector> hw_;
    std::shared_ptr<PerformanceMonitor> monitor_;
    std::shared_ptr<MemoryManager> mem_;
    std::shared_ptr<ProcessEngine> proc_;
    std::shared_ptr<BottleneckAnalyzer> bottleneck_;
    std::shared_ptr<TransactionJournal> journal_;
};

} // namespace OptiWin
