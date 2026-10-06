/**
 * OptiWinX Native Windows Optimizer v2.0
 * Source: StartupManager.cpp
 * 
 * Reversible Windows Startup Management Implementation
 */

#include "StartupManager.hpp"
#include <algorithm>

#if defined(_WIN32) || defined(__CYGWIN__) || defined(__MINGW32__)
#include <windows.h>
#endif

namespace OptiWin {

static RiskLevel AssessStartupRisk(const std::string& name, const std::string& cmd, std::string& outRec) {
    std::string lower = name;
    std::transform(lower.begin(), lower.end(), lower.begin(), [](unsigned char c) { return std::tolower(c); });

    if (lower.find("security") != std::string::npos || lower.find("defender") != std::string::npos ||
        lower.find("antivirus") != std::string::npos) {
        outRec = "Essential security monitor. Keep enabled.";
        return RiskLevel::High;
    }

    if (lower.find("audio") != std::string::npos || lower.find("realtek") != std::string::npos ||
        lower.find("nvidia") != std::string::npos || lower.find("intel") != std::string::npos ||
        lower.find("amd") != std::string::npos) {
        outRec = "Hardware driver tray utility. Safe to keep enabled.";
        return RiskLevel::Medium;
    }

    if (lower.find("steam") != std::string::npos || lower.find("discord") != std::string::npos ||
        lower.find("spotify") != std::string::npos || lower.find("epic") != std::string::npos) {
        outRec = "Gaming / chat background client. Safe to disable for faster boot times.";
        return RiskLevel::Low;
    }

    outRec = "Application helper. Evaluate based on user necessity.";
    return RiskLevel::Low;
}

void StartupManager::ScanRegistryKey(void* hRootKey, const std::string& subKey, const std::string& sourceName, std::vector<StartupEntry>& list) {
#if defined(_WIN32) || defined(__CYGWIN__) || defined(__MINGW32__)
    HKEY hKey = nullptr;
    if (RegOpenKeyExA(static_cast<HKEY>(hRootKey), subKey.c_str(), 0, KEY_READ, &hKey) == ERROR_SUCCESS) {
        DWORD index = 0;
        char valName[260];
        BYTE valData[1024];

        while (true) {
            DWORD nameSize = sizeof(valName);
            DWORD dataSize = sizeof(valData);
            DWORD type = 0;

            LONG res = RegEnumValueA(hKey, index, valName, &nameSize, nullptr, &type, valData, &dataSize);
            if (res != ERROR_SUCCESS) break;

            if (type == REG_SZ || type == REG_EXPAND_SZ) {
                StartupEntry entry;
                entry.name = valName;
                entry.command = reinterpret_cast<char*>(valData);
                entry.source = sourceName;
                entry.isEnabled = true;
                entry.risk = AssessStartupRisk(entry.name, entry.command, entry.recommendation);
                list.push_back(entry);
            }
            index++;
        }
        RegCloseKey(hKey);
    }
#endif
}

std::vector<StartupEntry> StartupManager::EnumerateStartupEntries() {
    std::vector<StartupEntry> list;
#if defined(_WIN32) || defined(__CYGWIN__) || defined(__MINGW32__)
    ScanRegistryKey(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Run", "HKCU\\Run", list);
    ScanRegistryKey(HKEY_LOCAL_MACHINE, "Software\\Microsoft\\Windows\\CurrentVersion\\Run", "HKLM\\Run", list);
#else
    StartupEntry e1; e1.name = "Discord"; e1.command = "C:\\Users\\User\\AppData\\Local\\Discord\\app.exe"; e1.source = "HKCU\\Run"; e1.isEnabled = true; e1.risk = RiskLevel::Low; e1.recommendation = "Chat background client. Safe to disable."; list.push_back(e1);
    StartupEntry e2; e2.name = "Steam"; e2.command = "\"C:\\Program Files (x86)\\Steam\\steam.exe\" -silent"; e2.source = "HKCU\\Run"; e2.isEnabled = true; e2.risk = RiskLevel::Low; e2.recommendation = "Game launcher. Safe to disable."; list.push_back(e2);
    StartupEntry e3; e3.name = "Spotify"; e3.command = "C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe --autostart"; e3.source = "HKCU\\Run"; e3.isEnabled = true; e3.risk = RiskLevel::Low; e3.recommendation = "Media player. Safe to disable."; list.push_back(e3);
    StartupEntry e4; e4.name = "SecurityHealth"; e4.command = "%windir%\\system32\\SecurityHealthSystray.exe"; e4.source = "HKLM\\Run"; e4.isEnabled = true; e4.risk = RiskLevel::High; e4.recommendation = "Essential security monitor. Keep enabled."; list.push_back(e4);
    StartupEntry e5; e5.name = "RtkAudUService"; e5.command = "\"C:\\Program Files\\Realtek\\Audio\\RtkAudUService64.exe\" -autorun"; e5.source = "HKLM\\Run"; e5.isEnabled = true; e5.risk = RiskLevel::Medium; e5.recommendation = "Audio driver helper. Safe to keep."; list.push_back(e5);
#endif
    return list;
}

bool StartupManager::ToggleStartupEntry(const std::string& name, const std::string& source, bool enable, std::string& outMessage) {
    // Reversible toggling: move to/from OptiWinX_Disabled registry branch
#if defined(_WIN32) || defined(__CYGWIN__) || defined(__MINGW32__)
    HKEY root = (source.find("HKCU") != std::string::npos) ? HKEY_CURRENT_USER : HKEY_LOCAL_MACHINE;
    std::string mainKey = "Software\\Microsoft\\Windows\\CurrentVersion\\Run";
    std::string disabledKey = "Software\\Microsoft\\Windows\\CurrentVersion\\Run\\OptiWinX_Disabled";

    if (!enable) {
        // Move from Run to OptiWinX_Disabled
        HKEY hMain = nullptr;
        if (RegOpenKeyExA(root, mainKey.c_str(), 0, KEY_READ | KEY_WRITE, &hMain) == ERROR_SUCCESS) {
            char valData[1024];
            DWORD dataSize = sizeof(valData);
            DWORD type = 0;
            if (RegQueryValueExA(hMain, name.c_str(), nullptr, &type, reinterpret_cast<LPBYTE>(valData), &dataSize) == ERROR_SUCCESS) {
                HKEY hDisabled = nullptr;
                if (RegCreateKeyExA(root, disabledKey.c_str(), 0, nullptr, REG_OPTION_NON_VOLATILE, KEY_WRITE, nullptr, &hDisabled, nullptr) == ERROR_SUCCESS) {
                    RegSetValueExA(hDisabled, name.c_str(), 0, type, reinterpret_cast<LPBYTE>(valData), dataSize);
                    RegCloseKey(hDisabled);
                    RegDeleteValueA(hMain, name.c_str());
                    RegCloseKey(hMain);
                    outMessage = "Reversibly disabled '" + name + "'. Command backed up for rollback.";
                    return true;
                }
            }
            RegCloseKey(hMain);
        }
    } else {
        // Restore from OptiWinX_Disabled to Run
        HKEY hDisabled = nullptr;
        if (RegOpenKeyExA(root, disabledKey.c_str(), 0, KEY_READ | KEY_WRITE, &hDisabled) == ERROR_SUCCESS) {
            char valData[1024];
            DWORD dataSize = sizeof(valData);
            DWORD type = 0;
            if (RegQueryValueExA(hDisabled, name.c_str(), nullptr, &type, reinterpret_cast<LPBYTE>(valData), &dataSize) == ERROR_SUCCESS) {
                HKEY hMain = nullptr;
                if (RegOpenKeyExA(root, mainKey.c_str(), 0, KEY_WRITE, &hMain) == ERROR_SUCCESS) {
                    RegSetValueExA(hMain, name.c_str(), 0, type, reinterpret_cast<LPBYTE>(valData), dataSize);
                    RegCloseKey(hMain);
                    RegDeleteValueA(hDisabled, name.c_str());
                    RegCloseKey(hDisabled);
                    outMessage = "Restored '" + name + "' to active startup configuration.";
                    return true;
                }
            }
            RegCloseKey(hDisabled);
        }
    }
    outMessage = "Unable to modify startup entry (elevation may be required for HKLM keys).";
    return false;
#else
    outMessage = (enable ? "Restored '" : "Reversibly disabled '") + name + "'.";
    return true;
#endif
}

} // namespace OptiWin
