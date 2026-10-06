/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: PerformanceMonitor.hpp
 * 
 * Performance Monitoring Engine (Section 5 & Section 31)
 * Low-overhead telemetry, rolling averages, hysteresis, and self-overhead reporting.
 */

#pragma once

#include "OptiWinCore.hpp"
#include <vector>
#include <deque>
#include <mutex>

namespace OptiWin {

class PerformanceMonitor {
public:
    explicit PerformanceMonitor(size_t historySamples = 10);
    ~PerformanceMonitor() = default;

    // Collect instantaneous snapshot and update rolling metrics
    SystemMetrics SampleMetrics();

    // Query current rolling average metrics
    SystemMetrics GetCurrentMetrics() const;

    // Query self-overhead (Section 31: OptiWinX resource footprint)
    void GetSelfOverhead(double& outCpuPercent, uint64_t& outWorkingSetBytes) const;

    // Set sample window size
    void SetHistorySize(size_t size);

private:
    void SampleCpu(SystemMetrics& metrics);
    void SampleMemory(SystemMetrics& metrics);
    void SampleGpu(SystemMetrics& metrics);

    mutable std::mutex metricsMutex_;
    size_t historySamples_;
    std::deque<SystemMetrics> history_;
    SystemMetrics lastSample_;

#if defined(_WIN32) || defined(__CYGWIN__) || defined(__MINGW32__)
    FILETIME prevIdleTime_{};
    FILETIME prevKernelTime_{};
    FILETIME prevUserTime_{};
    bool firstCpuSample_ = true;
#endif
};

} // namespace OptiWin
