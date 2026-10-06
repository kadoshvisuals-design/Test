/**
 * OptiWinX Native Windows Optimizer v2.0
 * Source: MainApp.cpp
 * 
 * Unified Application Entry Point:
 * Direct CLI Dispatcher (--analyze, --dry-run, --gaming, --rollback, --diagnostics, --version)
 * and Native Windows Desktop GUI Launcher.
 */

#include "OptiWinCore.hpp"
#include "HardwareDetector.hpp"
#include "PerformanceMonitor.hpp"
#include "MemoryManager.hpp"
#include "ProcessEngine.hpp"
#include "BottleneckAnalyzer.hpp"
#include "GamingModeEngine.hpp"
#include "TransactionJournal.hpp"
#include "Diagnostics.hpp"
#include "StartupManager.hpp"
#include "CleanupManager.hpp"
#include "OptiWinGUI.hpp"

#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <iomanip>

using namespace OptiWin;

static void PrintHelp() {
    std::cout << "OptiWinX Native Windows Optimizer v" << APP_VERSION << "\n";
    std::cout << "Target: " << APP_BUILD_TARGET << "\n\n";
    std::cout << "Usage:\n";
    std::cout << "  OptiWinX.exe                 Launch Native Windows Desktop GUI\n";
    std::cout << "  OptiWinX.exe --analyze       Inspect hardware, memory, and performance state\n";
    std::cout << "  OptiWinX.exe --dry-run       Simulate proposed optimizations (0 modifications)\n";
    std::cout << "  OptiWinX.exe --gaming        Activate Gaming Mode with transaction tracking\n";
    std::cout << "  OptiWinX.exe --rollback      Restore all active modified processes to original state\n";
    std::cout << "  OptiWinX.exe --diagnostics   Generate comprehensive system telemetry report\n";
    std::cout << "  OptiWinX.exe --cleanup       Audit and clean temporary caches\n";
    std::cout << "  OptiWinX.exe --version       Display version and build metadata\n\n";
    std::cout << "Safety Standard: Zero fake counters, verified rollbacks, strict process protection.\n";
}

int main(int argc, char* argv[]) {
    // Instantiate Core Subsystems
    auto hw = std::make_shared<HardwareDetector>();
    auto monitor = std::make_shared<PerformanceMonitor>();
    auto mem = std::make_shared<MemoryManager>();
    auto proc = std::make_shared<ProcessEngine>();
    auto bottleneck = std::make_shared<BottleneckAnalyzer>();
    auto journal = std::make_shared<TransactionJournal>("optiwin_recovery.journal");
    auto gaming = std::make_shared<GamingModeEngine>(proc, journal, monitor);
    auto diag = std::make_shared<DiagnosticsEngine>(hw, monitor, mem, proc, bottleneck, journal);
    auto startup = std::make_shared<StartupManager>();
    auto cleanup = std::make_shared<CleanupManager>();

    // 1. Check for crash recovery on startup (Section 14)
    auto recoveryLogs = journal->RecoverCrashedSession(*proc);
    if (!recoveryLogs.empty()) {
        std::cout << "[RECOVERY NOTICE]\n";
        for (const auto& log : recoveryLogs) {
            std::cout << "  * " << log << "\n";
        }
        std::cout << "\n";
    }

    // CLI argument dispatching
    if (argc > 1) {
        std::string arg = argv[1];

        if (arg == "--version" || arg == "-v") {
            std::cout << APP_NAME << " v" << APP_VERSION << " [" << APP_BUILD_TARGET << "]\n";
            std::cout << "Architectural Model: MEASURE -> ANALYZE -> IDENTIFY -> MINIMAL ACTION -> VERIFY -> ROLLBACK\n";
            return 0;
        }

        if (arg == "--help" || arg == "-h") {
            PrintHelp();
            return 0;
        }

        if (arg == "--analyze") {
            std::cout << "[OptiWinX Analysis Execution]\n";
            auto profile = hw->DetectAll();
            std::cout << HardwareDetector::FormatSummary(profile) << "\n";

            auto metrics = monitor->SampleMetrics();
            std::cout << "--- Telemetry Snapshot ---\n";
            std::cout << "CPU Load: " << std::fixed << std::setprecision(1) << metrics.cpuUsagePercent << "%\n";
            std::cout << "GPU Load: " << metrics.gpuUsagePercent << "% (VRAM: " << metrics.vramUsedMb << " / " << metrics.vramTotalMb << " MB)\n";
            std::cout << "Memory Load: " << metrics.ramUsagePercent << "% (Available: " << metrics.availableRamMb << " MB)\n";
            std::cout << "Memory Pressure Score: " << metrics.memoryPressureScore << "/100 [" << ToString(metrics.pressureState) << "]\n\n";

            auto diagResult = bottleneck->Analyze(metrics);
            std::cout << "--- Workload Diagnosis ---\n";
            std::cout << BottleneckAnalyzer::FormatReport(diagResult) << "\n";
            return 0;
        }

        if (arg == "--dry-run") {
            std::cout << "=================================================================\n";
            std::cout << "               OPTIWINX DRY-RUN OPTIMIZATION AUDIT               \n";
            std::cout << "=================================================================\n";
            std::cout << "IMPORTANT: DRY-RUN APPLIES ZERO SYSTEM MODIFICATIONS.\n\n";

            auto metrics = monitor->SampleMetrics();
            auto diagResult = bottleneck->Analyze(metrics);
            std::cout << "Workload State: " << ToString(diagResult.type) << " (Confidence: " << diagResult.confidencePercent << "%)\n";
            std::cout << "Memory Pressure: " << metrics.memoryPressureScore << "/100 [" << ToString(metrics.pressureState) << "]\n\n";

            auto actions = gaming->PlanOptimizations(SafetyPolicy::Safe);
            if (actions.empty()) {
                std::cout << "No eligible optimizations proposed. System is operating within nominal thresholds.\n";
            } else {
                std::cout << "Proposed Safe Optimizations (" << actions.size() << " candidate actions):\n";
                for (size_t i = 0; i < actions.size(); ++i) {
                    const auto& act = actions[i];
                    std::cout << "-----------------------------------------------------------------\n";
                    std::cout << "PROPOSED ACTION " << (i + 1) << ": " << act.processName << " (PID " << act.pid << ")\n";
                    std::cout << "Category: " << ToString(act.category) << "\n";
                    std::cout << "Priority Change: " << act.currentPriority << " -> " << act.proposedPriority << "\n";
                    std::cout << "EcoQoS Change: " << (act.currentEcoQoS ? "ON" : "OFF") << " -> " << (act.proposedEcoQoS ? "ON" : "OFF") << "\n";
                    std::cout << "Reason: " << act.reason << "\n";
                    std::cout << "Risk Level: " << ToString(act.risk) << " | Rollback Supported: YES\n";
                }
                std::cout << "-----------------------------------------------------------------\n";
            }
            std::cout << "\nDry-run complete. Total modifications applied: 0.\n";
            return 0;
        }

        if (arg == "--gaming") {
            std::cout << "[OptiWinX Gaming Mode Activation]\n";
            std::vector<std::string> log;
            bool success = gaming->Engage(SafetyPolicy::Safe, "", log);
            for (const auto& line : log) {
                std::cout << "  > " << line << "\n";
            }
            if (success) {
                std::cout << "\nGaming Mode active. Run 'OptiWinX.exe --rollback' to restore original states.\n";
                return 0;
            } else {
                std::cout << "\nFailed to engage Gaming Mode or no eligible processes found.\n";
                return 1;
            }
        }

        if (arg == "--rollback") {
            std::cout << "[OptiWinX Rollback Engine]\n";
            std::cout << "Restoring all modified processes to recorded original state...\n\n";
            auto results = journal->RollbackAll(*proc);
            for (const auto& r : results) {
                std::cout << "  * " << r << "\n";
            }
            std::cout << "\nRollback sequence finalized. Journal synchronized.\n";
            return 0;
        }

        if (arg == "--diagnostics") {
            std::cout << diag->GenerateFullReport() << "\n";
            return 0;
        }

        if (arg == "--cleanup") {
            std::cout << "[OptiWinX Targeted Cleanup Engine]\n";
            auto targets = cleanup->ScanTargets();
            std::cout << "Audited Cleanable Cache Targets:\n";
            std::vector<std::string> ids;
            for (const auto& t : targets) {
                double mb = static_cast<double>(t.totalBytes) / (1024.0 * 1024.0);
                std::cout << "  - [" << t.id << "] " << t.name << ": " << std::fixed << std::setprecision(1) << mb 
                          << " MB in " << t.fileCount << " files\n";
                ids.push_back(t.id);
            }
            std::cout << "\nExecuting safe cleanup of user caches...\n";
            auto res = cleanup->ExecuteCleanup(ids);
            std::cout << res.summary << "\n";
            return 0;
        }

        std::cerr << "Unknown argument: " << arg << "\n";
        PrintHelp();
        return 1;
    }

    // Default: Run Native Windows Desktop GUI
    std::cout << "Launching OptiWinX Native Windows Desktop GUI...\n";
    OptiWinGUI gui(hw, monitor, mem, proc, bottleneck, gaming, journal);
    return gui.Run(nullptr, 1);
}
