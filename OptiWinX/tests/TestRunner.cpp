/**
 * OptiWinX Native Windows Optimizer v2.0
 * Test Suite: TestRunner.cpp
 * 
 * Comprehensive Unit and Integration Test Runner (Section 27)
 * Verifies safety invariants, dry-run zero-modification rules,
 * memory pressure clamping, and rollback resilience.
 */

#include "OptiWinCore.hpp"
#include "HardwareDetector.hpp"
#include "PerformanceMonitor.hpp"
#include "MemoryManager.hpp"
#include "ProcessEngine.hpp"
#include "BottleneckAnalyzer.hpp"
#include "TransactionJournal.hpp"
#include "GamingModeEngine.hpp"
#include "StartupManager.hpp"
#include "CleanupManager.hpp"

#include <iostream>
#include <cassert>
#include <vector>
#include <string>
#include <cstdio>

using namespace OptiWin;

static int g_testsPassed = 0;
static int g_testsFailed = 0;

#define TEST_ASSERT(cond, msg) \
    do { \
        if (!(cond)) { \
            std::cerr << "[-] FAILED: " << msg << " (" << __FILE__ << ":" << __LINE__ << ")\n"; \
            g_testsFailed++; \
            return; \
        } \
    } while (0)

#define RUN_TEST(fn) \
    do { \
        std::cout << "[RUNNING] " << #fn << " ... "; \
        int before = g_testsFailed; \
        fn(); \
        if (g_testsFailed == before) { \
            std::cout << "PASSED\n"; \
            g_testsPassed++; \
        } \
    } while (0)

void TestHardwareDetection() {
    HardwareDetector hw;
    auto profile = hw.DetectAll();

    TEST_ASSERT(!profile.cpu.name.empty(), "CPU name must not be empty");
    TEST_ASSERT(profile.cpu.logicalProcessors > 0, "Logical CPU count must be > 0");
    TEST_ASSERT(profile.ram.totalPhysicalBytes > 0, "Total RAM bytes must be > 0");
    TEST_ASSERT(!profile.gpus.empty(), "At least one GPU adapter or fallback must be detected");
    TEST_ASSERT(!profile.drives.empty(), "At least one storage volume must be detected");
}

void TestMemoryPressureClamping() {
    MemoryManager mem;
    RamInfo lowRam;
    lowRam.totalPhysicalBytes = 16ULL * 1024 * 1024 * 1024;
    lowRam.availablePhysicalBytes = 12ULL * 1024 * 1024 * 1024;
    lowRam.totalCommitLimitBytes = 24ULL * 1024 * 1024 * 1024;
    lowRam.currentCommitBytes = 4ULL * 1024 * 1024 * 1024;

    uint32_t lowScore = mem.CalculatePressureScore(lowRam, 0.0);
    TEST_ASSERT(lowScore <= 40, "Low RAM load must yield Nominal pressure score <= 40");
    TEST_ASSERT(mem.GetPressureState(lowScore) == MemoryPressureState::Nominal, "State must be Nominal");

    RamInfo highRam;
    highRam.totalPhysicalBytes = 16ULL * 1024 * 1024 * 1024;
    highRam.availablePhysicalBytes = 1ULL * 1024 * 1024 * 1024; // 93% used
    highRam.totalCommitLimitBytes = 20ULL * 1024 * 1024 * 1024;
    highRam.currentCommitBytes = 19ULL * 1024 * 1024 * 1024; // 95% commit

    uint32_t highScore = mem.CalculatePressureScore(highRam, 10.0);
    TEST_ASSERT(highScore >= 80, "Sustained high load must yield score >= 80");
    TEST_ASSERT(highScore <= 100, "Score MUST be clamped to 100");
}

void TestProcessExclusionsAndSafety() {
    ProcessEngine engine;

    // Test critical processes are classified correctly and EXCLUDED
    TEST_ASSERT(engine.ClassifyProcess("lsass.exe", false, false) == ProcessCategory::CriticalSystem, "lsass.exe must be CriticalSystem");
    TEST_ASSERT(engine.IsProcessExcluded("lsass.exe", ProcessCategory::CriticalSystem), "lsass.exe MUST be permanently excluded");

    TEST_ASSERT(engine.ClassifyProcess("dwm.exe", false, false) == ProcessCategory::CriticalSystem, "dwm.exe must be CriticalSystem");
    TEST_ASSERT(engine.IsProcessExcluded("dwm.exe", ProcessCategory::CriticalSystem), "dwm.exe MUST be permanently excluded");

    TEST_ASSERT(engine.ClassifyProcess("MsMpEng.exe", false, false) == ProcessCategory::Security, "MsMpEng.exe must be Security");
    TEST_ASSERT(engine.IsProcessExcluded("MsMpEng.exe", ProcessCategory::Security), "MsMpEng.exe MUST be excluded");

    // Realtime priority ban
#if defined(_WIN32) || defined(__CYGWIN__) || defined(__MINGW32__)
    auto prioRes = engine.SetProcessPriority(1234, REALTIME_PRIORITY_CLASS);
    TEST_ASSERT(!prioRes.success, "REALTIME_PRIORITY_CLASS must be rejected unconditionally");
#endif
}

void TestBottleneckClassification() {
    BottleneckAnalyzer analyzer(5);

    // Feed GPU-bound telemetry
    SystemMetrics mGpu;
    mGpu.cpuUsagePercent = 35.0;
    mGpu.gpuUsagePercent = 96.0;
    mGpu.ramUsagePercent = 45.0;
    mGpu.commitUsagePercent = 40.0;
    mGpu.memoryPressureScore = 35;
    mGpu.vramUsedMb = 5000;
    mGpu.vramTotalMb = 8192;
    mGpu.timestamp = "12:00:00";

    for (int i = 0; i < 4; ++i) analyzer.Analyze(mGpu);
    auto diagGpu = analyzer.Analyze(mGpu);

    TEST_ASSERT(diagGpu.type == BottleneckType::GpuBound, "High GPU (96%) and low CPU (35%) must diagnose GPU-BOUND");
    TEST_ASSERT(diagGpu.confidencePercent >= 80, "GPU-bound confidence must be >= 80%");

    // Feed CPU-bound telemetry
    BottleneckAnalyzer analyzerCpu(5);
    SystemMetrics mCpu;
    mCpu.cpuUsagePercent = 95.0;
    mCpu.gpuUsagePercent = 40.0;
    mCpu.ramUsagePercent = 50.0;
    mCpu.commitUsagePercent = 45.0;
    mCpu.memoryPressureScore = 40;
    mCpu.vramUsedMb = 3000;
    mCpu.vramTotalMb = 8192;
    mCpu.timestamp = "12:00:05";

    for (int i = 0; i < 4; ++i) analyzerCpu.Analyze(mCpu);
    auto diagCpu = analyzerCpu.Analyze(mCpu);

    TEST_ASSERT(diagCpu.type == BottleneckType::CpuBound, "High CPU (95%) and low GPU (40%) must diagnose CPU-BOUND");
}

void TestDryRunZeroModifications() {
    auto proc = std::make_shared<ProcessEngine>();
    auto journal = std::make_shared<TransactionJournal>("test_dryrun.journal");
    auto monitor = std::make_shared<PerformanceMonitor>();
    GamingModeEngine gaming(proc, journal, monitor);

    // Call dry run
    auto proposed = gaming.PlanOptimizations(SafetyPolicy::Safe);

    // Ensure ZERO transactions were opened in journal
    TEST_ASSERT(journal->GetActiveTransactions().empty(), "Dry-run MUST create 0 active transactions");
    TEST_ASSERT(!gaming.GetStatus().isActive, "Gaming Mode must remain INACTIVE during dry-run");

    std::remove("test_dryrun.journal");
}

void TestTransactionJournalAndRollback() {
    std::string testFile = "test_rollback.journal";
    std::remove(testFile.c_str());

    auto proc = std::make_shared<ProcessEngine>();
    auto journal = std::make_shared<TransactionJournal>(testFile);

    // Create a transaction
    std::string txId = journal->BeginTransaction(8244, "chrome.exe", 0x20, false, 0x4000, true, "Testing rollback", RiskLevel::Low);
    journal->MarkApplied(txId, "Verified");

    TEST_ASSERT(journal->HasActiveTransactions(), "Journal must record active transaction");

    // Perform rollback
    std::string outMsg;
    bool ok = journal->RollbackTransaction(txId, *proc, outMsg);
    TEST_ASSERT(ok, "Rollback transaction must succeed or report non-existence cleanly");

    // Verify journal no longer has active transactions
    TEST_ASSERT(!journal->HasActiveTransactions(), "No active transactions should remain after rollback");

    std::remove(testFile.c_str());
}

void TestProcessDisappearanceResilience() {
    std::string testFile = "test_disappear.journal";
    std::remove(testFile.c_str());

    auto proc = std::make_shared<ProcessEngine>();
    auto journal = std::make_shared<TransactionJournal>(testFile);

    // Non-existent PID 9999999
    std::string txId = journal->BeginTransaction(9999999, "nonexistent.exe", 0x20, false, 0x4000, true, "Test ghost PID", RiskLevel::Low);
    journal->MarkApplied(txId, "Verified");

    std::string msg;
    bool res = journal->RollbackTransaction(txId, *proc, msg);
    TEST_ASSERT(res, "Disappeared process must report safe completion without crashing");
    TEST_ASSERT(msg.find("no longer exists") != std::string::npos, "Message must state process no longer exists");

    std::remove(testFile.c_str());
}

int main() {
    std::cout << "=========================================================\n";
    std::cout << "         OptiWinX v2.0 Native Test Suite Execution       \n";
    std::cout << "=========================================================\n";

    RUN_TEST(TestHardwareDetection);
    RUN_TEST(TestMemoryPressureClamping);
    RUN_TEST(TestProcessExclusionsAndSafety);
    RUN_TEST(TestBottleneckClassification);
    RUN_TEST(TestDryRunZeroModifications);
    RUN_TEST(TestTransactionJournalAndRollback);
    RUN_TEST(TestProcessDisappearanceResilience);

    std::cout << "\nTest Summary: " << g_testsPassed << " passed, " << g_testsFailed << " failed.\n";
    return (g_testsFailed == 0) ? 0 : 1;
}
