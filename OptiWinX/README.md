# OptiWinX Native Windows Optimizer v2.0

> **A Serious Windows Systems Utility, Not a Snake-Oil PC Booster.**
> Built in modern C++20 for Windows 10 and Windows 11 x64.

---

## 1. Core Operating Model

OptiWinX operates on a strict, evidence-based engineering cycle:

```
MEASURE  -->  ANALYZE  -->  IDENTIFY BOTTLENECK  -->  DETERMINE SAFE ACTION  -->  APPLY MINIMAL CHANGE  -->  VERIFY  -->  KEEP OR ROLLBACK
```

OptiWinX prioritizes **safety, transparency, measurable evidence, reversibility, and compatibility** over aggressive, undocumented "tweaks".

---

## 2. Explicit Scope: What OptiWinX Does and Does NOT Do

### What OptiWinX Does:
- **Comprehensive Hardware Auto-Detection**: Detects CPU cores, frequency, cache, and AVX instructions; physical and commit RAM; DXGI Direct3D 12 GPUs and dedicated VRAM; Windows build and elevation state; storage drives.
- **Adaptive Memory Pressure Engine**: Calculates a normalized, multi-factor Memory Pressure Score (0–100) combining physical RAM utilization, commit charge, and hard page fault rates.
- **Low-Overhead Performance Monitoring**: Samples CPU, GPU, VRAM, and RAM with rolling averages and hysteresis to prevent oscillatory state flipping.
- **Workload Bottleneck Diagnosis**: Classifies system constraints into `CPU-BOUND`, `GPU-BOUND`, `VRAM-PRESSURE`, `RAM-PRESSURE`, or `BALANCED` with confidence scores and explicit supporting evidence.
- **Process Intelligence & Classification**: Categorizes processes into Critical System, Windows Core, Security, Drivers, Games, Foreground, and Background.
- **Permanent Process Protection**: Excludes critical Windows components (`lsass.exe`, `csrss.exe`, `services.exe`, `dwm.exe`, `MsMpEng.exe`) from any modification.
- **Transaction-Backed Gaming Mode**: Safely throttles eligible non-critical background processes using `BELOW_NORMAL_PRIORITY_CLASS` and Windows 11 **EcoQoS** power throttling (`ProcessPowerThrottling`).
- **Crash Recovery Journal**: Records every modification in both memory and a persistent journal file (`optiwin_recovery.journal`). If the system crashes, incomplete transactions are safely recovered and restored on the next startup.
- **Dry-Run Mode (`--dry-run`)**: Simulates all proposed optimizations and audits potential changes with **zero system modifications**.
- **Reversible Startup Management**: Audits Run keys and allows reversible disabling into backup subkeys.
- **Targeted Temporary Cleanup**: Safely audits and clears `%TEMP%`, crash minidumps, and system caches with upfront byte reporting.
- **Native Fluent Dark Desktop GUI & CLI**: Windows 11 Fluent dark UI (`#1E1E1E` / `#00E5FF`) and comprehensive CLI tooling.

### What OptiWinX Does NOT Do (Non-Goals):
- **NO Fixed FPS Guarantees**: Does not manufacture artificial benchmark scores or claim guaranteed FPS increases.
- **NO Indiscriminate RAM Purging**: Does not blindly purge standby cache or constantly trim working sets. Windows utilizes standby memory for caching; clearing standby cache harms responsiveness.
- **NO Kernel Hacks or Security Bypass**: Never circumvents UAC, driver signing, memory isolation, or Windows Defender.
- **NO Overclocking or Voltage Modification**: Never alters BIOS settings, GPU voltages, CPU multipliers, or thermal limits.
- **NO Game Memory Tampering**: Never injects DLLs, hooks DirectX shaders, or tampers with game processes. 100% compliant with anti-cheat software (Easy Anti-Cheat, BattlEye, Vanguard).

---

## 3. Supported Operating Systems

- **Windows 11 x64** (Build 22000 or newer) — *Full support including native EcoQoS process power throttling*.
- **Windows 10 x64** (Version 20H1 / Build 19041 or newer) — *Process priority management, telemetry, bottleneck analysis, and diagnostics*.

---

## 4. Build Requirements

- **Operating System**: Windows 10/11 x64 (or cross-compilation with MinGW-w64 GCC 12+ C++20).
- **Compiler**: Visual Studio 2022 (MSVC v143 or newer) with C++20 Desktop Development workload.
- **Build System**: CMake 3.20 or newer.
- **Architecture Target**: x64 exclusively.

---

## 5. How to Compile

### Quick Build (Command Line):
Open the **x64 Native Tools Command Prompt for VS 2022** and execute:
```cmd
build_x64.bat
```
The script automatically configures CMake, builds the optimized Release x64 binaries, runs all automated safety tests, and outputs the binary path.

### Manual CMake Build:
```cmd
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release --parallel
```
To run unit and safety tests:
```cmd
ctest --test-dir build -C Release --output-on-failure
```

---

## 6. Command-Line Interface (CLI)

| Flag | Purpose | Safety Invariant |
| :--- | :--- | :--- |
| `OptiWinX.exe` | Launches the Native Windows Desktop GUI | Live telemetry, dark Fluent interface |
| `OptiWinX.exe --analyze` | Runs full hardware, memory, and performance diagnosis | Read-only telemetry |
| `OptiWinX.exe --dry-run` | Audits proposed optimizations without changing anything | **0 system modifications** |
| `OptiWinX.exe --gaming` | Engages Gaming Mode with transaction tracking | Journal-backed, verified |
| `OptiWinX.exe --rollback` | Restores all active modified processes to original state | Reversible restoration |
| `OptiWinX.exe --diagnostics` | Generates a full system diagnostic and bottleneck report | Read-only telemetry |
| `OptiWinX.exe --cleanup` | Audits and cleans temporary caches | Explicit pre-scan display |
| `OptiWinX.exe --version` | Displays version and architectural targets | Informational |

---

## 7. How Rollback Works

Every modification is managed through the `TransactionJournal`:
1. Before modifying a process, the original priority class and EcoQoS state are recorded along with a unique `TX-PID-timestamp` ID.
2. The change is applied using Win32 `SetPriorityClass` or `SetProcessInformation(ProcessPowerThrottling)`.
3. The new state is immediately verified using `GetPriorityClass`. If verification fails, the transaction is immediately rolled back.
4. If a user invokes `--rollback` or toggles off Gaming Mode, each transaction is iterated and restored.
5. If a target process was closed or terminated during the session, the engine reports:
   > *"Process no longer exists; no restoration required."*
   This is treated as clean completion rather than a failure.
6. The journal is persisted to `optiwin_recovery.journal`. If the computer reboots or crashes while optimizations are active, OptiWinX automatically detects the unfinalized transactions on next launch and recovers original states.

---

## 8. Self-Overhead and Performance Footprint

OptiWinX adheres to Section 31: It exposes its own resource consumption:
- **Idle CPU Overhead**: `< 0.2%`
- **Memory Footprint**: `~16 - 20 MB Working Set`
- **Zero Polling Loops**: Uses configurable timer ticks (1000ms standard).
- **Zero External Telemetry**: 100% offline, private, and local.
