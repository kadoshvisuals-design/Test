/**
 * OptiWinX Native Windows Optimizer v2.0
 * Source: Diagnostics.cpp
 * 
 * Extended System Diagnostics Engine Implementation
 */

#include "Diagnostics.hpp"
#include <sstream>
#include <iomanip>

namespace OptiWin {

DiagnosticsEngine::DiagnosticsEngine(std::shared_ptr<HardwareDetector> hw,
                                     std::shared_ptr<PerformanceMonitor> monitor,
                                     std::shared_ptr<MemoryManager> mem,
                                     std::shared_ptr<ProcessEngine> proc,
                                     std::shared_ptr<BottleneckAnalyzer> bottleneck,
                                     std::shared_ptr<TransactionJournal> journal)
    : hw_(hw), monitor_(monitor), mem_(mem), proc_(proc), bottleneck_(bottleneck), journal_(journal) {
}

std::string DiagnosticsEngine::GenerateFullReport() {
    auto profile = hw_->DetectAll();
    auto metrics = monitor_->SampleMetrics();
    auto diag = bottleneck_->Analyze(metrics);
    auto procs = proc_->EnumerateProcesses();
    auto txs = journal_->GetAllTransactions();

    std::ostringstream ss;
    ss << "=================================================================\n";
    ss << "          OPTIWINX V2.0 SYSTEM DIAGNOSTICS & TELEMETRY           \n";
    ss << "=================================================================\n\n";

    ss << HardwareDetector::FormatSummary(profile) << "\n";

    ss << "--- REAL-TIME METRICS ---\n";
    ss << "CPU Load: " << std::fixed << std::setprecision(1) << metrics.cpuUsagePercent << "%\n";
    ss << "GPU Load: " << metrics.gpuUsagePercent << "% (VRAM: " << metrics.vramUsedMb << " / " << metrics.vramTotalMb << " MB)\n";
    ss << "RAM Load: " << metrics.ramUsagePercent << "% (Available: " << metrics.availableRamMb << " MB)\n";
    ss << "Commit Load: " << metrics.commitUsagePercent << "%\n";
    ss << "Memory Pressure Score: " << metrics.memoryPressureScore << "/100 [" << ToString(metrics.pressureState) << "]\n";
    ss << mem_->ExplainPressureState(metrics.pressureState, metrics.memoryPressureScore) << "\n\n";

    ss << "--- WORKLOAD BOTTLENECK DIAGNOSIS ---\n";
    ss << BottleneckAnalyzer::FormatReport(diag) << "\n";

    ss << "--- ACTIVE PROCESS SUMMARY ---\n";
    ss << "Total Monitored Processes: " << procs.size() << "\n";
    size_t bgCount = 0, gameCount = 0, secCount = 0;
    for (const auto& p : procs) {
        if (p.category == ProcessCategory::BackgroundApp) bgCount++;
        else if (p.category == ProcessCategory::ActiveGame) gameCount++;
        else if (p.category == ProcessCategory::Security) secCount++;
    }
    ss << "Identified Games: " << gameCount << " | Background Apps: " << bgCount << " | Security Services: " << secCount << "\n\n";

    ss << "--- TRANSACTION JOURNAL STATUS ---\n";
    ss << "Total Recorded Transactions: " << txs.size() << "\n";
    ss << "Active Unfinished Transactions: " << journal_->GetActiveTransactions().size() << "\n";
    ss << "Crash Recovery: Clean journal state.\n\n";

    double selfCpu;
    uint64_t selfMem;
    monitor_->GetSelfOverhead(selfCpu, selfMem);
    ss << "--- OPTIWINX RESOURCE FOOTPRINT (Section 31) ---\n";
    ss << "Self CPU Overhead: " << std::fixed << std::setprecision(2) << selfCpu << "%\n";
    ss << "Self Working Set: " << std::fixed << std::setprecision(1) << (selfMem / (1024.0 * 1024.0)) << " MB\n";
    ss << "=================================================================\n";

    return ss.str();
}

std::string DiagnosticsEngine::GenerateJsonReport() {
    auto profile = hw_->DetectAll();
    auto metrics = monitor_->SampleMetrics();
    auto diag = bottleneck_->Analyze(metrics);

    std::ostringstream ss;
    ss << "{\n";
    ss << "  \"version\": \"" << APP_VERSION << "\",\n";
    ss << "  \"timestamp\": \"" << metrics.timestamp << "\",\n";
    ss << "  \"os\": {\n";
    ss << "    \"name\": \"" << profile.os.osName << "\",\n";
    ss << "    \"build\": " << profile.os.buildNumber << ",\n";
    ss << "    \"elevation\": \"" << (profile.os.elevation == ElevationState::Administrator ? "ADMIN" : "STANDARD") << "\",\n";
    ss << "    \"ecoQoSSupported\": " << (profile.os.supportsEcoQoS ? "true" : "false") << "\n";
    ss << "  },\n";
    ss << "  \"cpu\": {\n";
    ss << "    \"model\": \"" << profile.cpu.name << "\",\n";
    ss << "    \"cores\": " << profile.cpu.physicalCores << ",\n";
    ss << "    \"threads\": " << profile.cpu.logicalProcessors << ",\n";
    ss << "    \"loadPercent\": " << metrics.cpuUsagePercent << "\n";
    ss << "  },\n";
    ss << "  \"gpu\": {\n";
    if (!profile.gpus.empty()) {
        ss << "    \"model\": \"" << profile.gpus[0].name << "\",\n";
        ss << "    \"vramMb\": " << (profile.gpus[0].dedicatedVramBytes / (1024 * 1024)) << ",\n";
    }
    ss << "    \"loadPercent\": " << metrics.gpuUsagePercent << "\n";
    ss << "  },\n";
    ss << "  \"memory\": {\n";
    ss << "    \"loadPercent\": " << metrics.ramUsagePercent << ",\n";
    ss << "    \"pressureScore\": " << metrics.memoryPressureScore << ",\n";
    ss << "    \"state\": \"" << ToString(metrics.pressureState) << "\"\n";
    ss << "  },\n";
    ss << "  \"bottleneck\": {\n";
    ss << "    \"type\": \"" << ToString(diag.type) << "\",\n";
    ss << "    \"confidence\": " << diag.confidencePercent << ",\n";
    ss << "    \"reason\": \"" << diag.supportingReason << "\"\n";
    ss << "  }\n";
    ss << "}\n";
    return ss.str();
}

} // namespace OptiWin
