/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: CleanupManager.hpp
 * 
 * Targeted Cleanup Engine (Section 18)
 * Explicit path auditing, byte quantification, and safe temp file recovery.
 */

#pragma once

#include "OptiWinCore.hpp"
#include <string>
#include <vector>

namespace OptiWin {

struct CleanupTarget {
    std::string id;
    std::string name;
    std::string path;
    std::string description;
    uint64_t totalBytes = 0;
    uint32_t fileCount = 0;
    bool requiresElevation = false;
    bool isSafe = true;
};

struct CleanupResult {
    bool success = false;
    uint64_t bytesFreed = 0;
    uint32_t filesDeleted = 0;
    uint32_t errorsEncountered = 0;
    std::string summary;
};

class CleanupManager {
public:
    CleanupManager() = default;
    ~CleanupManager() = default;

    // Scan all candidate targets without deleting anything
    std::vector<CleanupTarget> ScanTargets();

    // Perform cleanup on selected target IDs
    CleanupResult ExecuteCleanup(const std::vector<std::string>& selectedTargetIds);

private:
    void AuditDirectory(const std::string& path, uint64_t& outBytes, uint32_t& outFiles);
    void CleanDirectory(const std::string& path, uint64_t& outBytes, uint32_t& outFiles, uint32_t& outErrors);
};

} // namespace OptiWin
