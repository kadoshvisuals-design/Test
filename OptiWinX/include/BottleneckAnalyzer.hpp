/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: BottleneckAnalyzer.hpp
 * 
 * Bottleneck Analysis Engine (Section 10 & Section 22)
 * Multi-metric correlation, confidence scoring, supporting evidence, and limitations.
 */

#pragma once

#include "OptiWinCore.hpp"
#include <deque>

namespace OptiWin {

class BottleneckAnalyzer {
public:
    explicit BottleneckAnalyzer(size_t windowSamples = 8);
    ~BottleneckAnalyzer() = default;

    // Ingest latest metrics and produce rigorous diagnosis
    BottleneckDiagnosis Analyze(const SystemMetrics& metrics);

    // Format human-readable diagnostic report
    static std::string FormatReport(const BottleneckDiagnosis& diag);

private:
    size_t windowSamples_;
    std::deque<SystemMetrics> metricsWindow_;
};

} // namespace OptiWin
