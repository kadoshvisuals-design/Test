/**
 * OptiWinX Native Windows Optimizer v2.0
 * Header: StartupManager.hpp
 * 
 * Reversible Windows Startup Management (Section 17)
 * Registry HKCU/HKLM inspection, risk classification, and reversible toggling.
 */

#pragma once

#include "OptiWinCore.hpp"
#include <string>
#include <vector>

namespace OptiWin {

struct StartupEntry {
    std::string name;
    std::string command;
    std::string source; // "HKCU\\Run", "HKLM\\Run", "StartupFolder"
    bool isEnabled = true;
    RiskLevel risk = RiskLevel::Low;
    std::string recommendation;
};

class StartupManager {
public:
    StartupManager() = default;
    ~StartupManager() = default;

    // Enumerate registered startup items
    std::vector<StartupEntry> EnumerateStartupEntries();

    // Reversibly enable or disable a startup item
    bool ToggleStartupEntry(const std::string& name, const std::string& source, bool enable, std::string& outMessage);

private:
    void ScanRegistryKey(void* hRootKey, const std::string& subKey, const std::string& sourceName, std::vector<StartupEntry>& list);
};

} // namespace OptiWin
