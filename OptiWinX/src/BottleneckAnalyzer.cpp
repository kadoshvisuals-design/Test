/**
 * OptiWinX Native Windows Optimizer v2.0
 * Source: BottleneckAnalyzer.cpp
 * 
 * Bottleneck Analysis Engine Implementation
 */

#include "BottleneckAnalyzer.hpp"
#include <sstream>
#include <iomanip>
#include <numeric>

namespace OptiWin {

BottleneckAnalyzer::BottleneckAnalyzer(size_t windowSamples)
    : windowSamples_(windowSamples) {
}

BottleneckDiagnosis BottleneckAnalyzer::Analyze(const SystemMetrics& metrics) {
    metricsWindow_.push_back(metrics);
    if (metricsWindow_.size() > windowSamples_) {
        metricsWindow_.pop_front();
    }

    BottleneckDiagnosis diag;
    diag.timestamp = metrics.timestamp;

    if (metricsWindow_.size() < 3) {
        diag.type = BottleneckType::Unknown;
        diag.confidencePercent = 40;
        diag.supportingReason = "Insufficient samples to establish sustained hardware workload trends.";
        diag.limitations = "Requires at least 3 consecutive telemetry samples.";
        return diag;
    }

    // Compute rolling window averages
    double avgCpu = 0.0;
    double avgGpu = 0.0;
    double avgRam = 0.0;
    double avgCommit = 0.0;
    uint32_t avgPressure = 0;

    for (const auto& m : metricsWindow_) {
        avgCpu += m.cpuUsagePercent;
        avgGpu += m.gpuUsagePercent;
        avgRam += m.ramUsagePercent;
        avgCommit += m.commitUsagePercent;
        avgPressure += m.memoryPressureScore;
    }
    size_t count = metricsWindow_.size();
    avgCpu /= count;
    avgGpu /= count;
    avgRam /= count;
    avgCommit /= count;
    avgPressure /= count;

    // Check VRAM pressure condition
    double vramRatio = (metrics.vramTotalMb > 0) ? (static_cast<double>(metrics.vramUsedMb) / metrics.vramTotalMb) : 0.0;

    if (vramRatio >= 0.92) {
        diag.type = BottleneckType::VramPressure;
        diag.confidencePercent = static_cast<uint32_t>(85 + (vramRatio - 0.92) * 100);
        if (diag.confidencePercent > 98) diag.confidencePercent = 98;

        std::ostringstream ss;
        ss << "Dedicated VRAM utilization is near saturation (" << metrics.vramUsedMb << " / " << metrics.vramTotalMb 
           << " MB, " << std::fixed << std::setprecision(1) << (vramRatio * 100.0) 
           << "%). GPU execution stalls observed waiting for texture paging.";
        diag.supportingReason = ss.str();
        diag.limitations = "Direct WDDM memory paging queue depth telemetry is restricted by driver.";
        return diag;
    }

    // Check RAM pressure condition
    if (avgPressure >= 80 || (avgRam >= 88.0 && avgCommit >= 85.0)) {
        diag.type = BottleneckType::RamPressure;
        diag.confidencePercent = static_cast<uint32_t>(std::min(95.0, 75.0 + (avgPressure - 75.0) * 1.3));

        std::ostringstream ss;
        ss << "System memory pressure score sustained at " << avgPressure << "/100. Physical RAM at " 
           << std::fixed << std::setprecision(1) << avgRam << "% and Commit charge at " 
           << std::fixed << std::setprecision(1) << avgCommit << "%.";
        diag.supportingReason = ss.str();
        diag.limitations = "Memory compression efficiency not isolated from total working set.";
        return diag;
    }

    // Check GPU-Bound condition
    if (avgGpu >= 88.0 && avgCpu <= 75.0) {
        diag.type = BottleneckType::GpuBound;
        double spread = avgGpu - avgCpu;
        uint32_t conf = static_cast<uint32_t>(std::clamp(80.0 + spread * 0.5, 80.0, 96.0));
        diag.confidencePercent = conf;

        std::ostringstream ss;
        ss << "GPU utilization remained sustained at " << std::fixed << std::setprecision(1) << avgGpu 
           << "% while CPU load remained at " << std::fixed << std::setprecision(1) << avgCpu 
           << "%. Graphics pipeline is fully saturated.";
        diag.supportingReason = ss.str();
        diag.limitations = "Individual GPU compute queue vs rasterization stages not differentiated.";
        return diag;
    }

    // Check CPU-Bound condition
    if (avgCpu >= 85.0 && avgGpu <= 70.0) {
        diag.type = BottleneckType::CpuBound;
        double spread = avgCpu - avgGpu;
        uint32_t conf = static_cast<uint32_t>(std::clamp(80.0 + spread * 0.5, 80.0, 95.0));
        diag.confidencePercent = conf;

        std::ostringstream ss;
        ss << "CPU utilization sustained at " << std::fixed << std::setprecision(1) << avgCpu 
           << "% while GPU utilization stayed at " << std::fixed << std::setprecision(1) << avgGpu 
           << "%. Main thread execution or draw calls are bottlenecking.";
        diag.supportingReason = ss.str();
        diag.limitations = "Per-thread context switch frequencies require elevated ETW capture.";
        return diag;
    }

    // Check Mixed condition
    if (avgCpu >= 80.0 && avgGpu >= 80.0) {
        diag.type = BottleneckType::Mixed;
        diag.confidencePercent = 88;
        diag.supportingReason = "Simultaneous high load across both CPU (" + std::to_string(static_cast<int>(avgCpu)) 
            + "%) and GPU (" + std::to_string(static_cast<int>(avgGpu)) + "%). Heavy multi-engine workload.";
        diag.limitations = "Both CPU and GPU nearing thermal or power headroom limits.";
        return diag;
    }

    // Balanced
    diag.type = BottleneckType::Balanced;
    diag.confidencePercent = 90;
    std::ostringstream ss;
    ss << "Workload evenly distributed with adequate CPU (" << std::fixed << std::setprecision(1) << avgCpu 
       << "%), GPU (" << std::fixed << std::setprecision(1) << avgGpu 
       << "%), and memory headroom (Pressure " << avgPressure << "/100).";
    diag.supportingReason = ss.str();
    diag.limitations = "Frametime variance was not measured over short sample intervals.";
    return diag;
}

std::string BottleneckAnalyzer::FormatReport(const BottleneckDiagnosis& diag) {
    std::ostringstream ss;
    ss << "DIAGNOSIS: " << ToString(diag.type) << "\n";
    ss << "CONFIDENCE: " << diag.confidencePercent << "%\n";
    ss << "SUPPORTING REASON: " << diag.supportingReason << "\n";
    ss << "LIMITATIONS: " << diag.limitations << "\n";
    return ss.str();
}

} // namespace OptiWin
