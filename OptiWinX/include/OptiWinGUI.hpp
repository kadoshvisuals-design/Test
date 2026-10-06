/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: OptiWinGUI.hpp
 * 
 * Native Windows Desktop GUI Layer (Section 21, 22, 23)
 * Windows 11 Fluent Dark UI implementation using Win32 API.
 */

#pragma once

#include "OptiWinCore.hpp"
#include "HardwareDetector.hpp"
#include "PerformanceMonitor.hpp"
#include "MemoryManager.hpp"
#include "ProcessEngine.hpp"
#include "BottleneckAnalyzer.hpp"
#include "GamingModeEngine.hpp"
#include "TransactionJournal.hpp"
#include <memory>
#include <string>

namespace OptiWin {

class OptiWinGUI {
public:
    OptiWinGUI(std::shared_ptr<HardwareDetector> hw,
               std::shared_ptr<PerformanceMonitor> monitor,
               std::shared_ptr<MemoryManager> mem,
               std::shared_ptr<ProcessEngine> proc,
               std::shared_ptr<BottleneckAnalyzer> bottleneck,
               std::shared_ptr<GamingModeEngine> gaming,
               std::shared_ptr<TransactionJournal> journal);
    ~OptiWinGUI();

    // Initialize and run the native Win32 window message loop
    int Run(void* hInstance, int nCmdShow);

private:
    std::shared_ptr<HardwareDetector> hw_;
    std::shared_ptr<PerformanceMonitor> monitor_;
    std::shared_ptr<MemoryManager> mem_;
    std::shared_ptr<ProcessEngine> proc_;
    std::shared_ptr<BottleneckAnalyzer> bottleneck_;
    std::shared_ptr<GamingModeEngine> gaming_;
    std::shared_ptr<TransactionJournal> journal_;
};

} // namespace OptiWin
