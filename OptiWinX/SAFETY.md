# OptiWinX Safety Constitution & Technical Policies

> **Architectural Safety Invariants and Windows Kernel Discipline.**

---

## 1. The Myth of "RAM Boosters" & Standby Memory Reality

Traditional "PC cleaner" utilities deceive users by displaying high RAM usage as an inherent failure.

### The Truth About Windows Memory Management:
- **Free RAM is Wasted RAM**: The Windows Memory Manager (SuperFetch / SysMain) intentionally retains frequently accessed executables, game assets, and file buffers in **Standby Memory** (`StandbyCache`).
- **Zero Overhead**: When a game or active application requests additional physical memory, the Windows kernel instantly repurposes standby pages within sub-microsecond latency without writing to disk.
- **Why Blind Purging Harms Performance**: Blindly issuing `NtSetSystemInformation(SystemMemoryListInformation)` or global working set flushes evicts useful disk caches. When the game subsequently requires those assets, it is forced to execute expensive disk reads, creating **micro-stutters and framerate drops**.

### OptiWinX Discipline:
- OptiWinX **never** performs global standby list purging.
- Working-set trimming (`EmptyWorkingSet`) is restricted strictly to:
  1. Background non-critical applications.
  2. Sustained memory pressure score $\ge 75/100$.
  3. Strict 5-minute cooldown per PID to prevent thrashing.
  4. If recovered delta is $< 1\text{ MB}$, OptiWinX honestly logs: *"No measurable improvement detected."*

---

## 2. Process Priority Management Safety

### The Ban on `REALTIME_PRIORITY_CLASS`:
- The Win32 priority range spans from 0 to 31. `REALTIME_PRIORITY_CLASS` runs at priorities 16 through 31.
- Running games or utilities in `REALTIME` preempts kernel threads, hardware interrupt service routines (ISRs), deferred procedure calls (DPCs), keyboard input drivers, and mouse polling threads.
- Preemption of mouse/keyboard input creates input lag, system stutter, and potential hard deadlocks.
- **Safety Invariant**: OptiWinX strictly forbids `REALTIME_PRIORITY_CLASS`. Any attempt to request it is rejected at the architecture level.

### Safe Priority Allocation:
- **Active Game**: Promoted to `ABOVE_NORMAL_PRIORITY_CLASS` (priority 10). Gives slight scheduler preference over default user apps (priority 8) without starving system drivers or input threads.
- **Background Applications**: Demoted to `BELOW_NORMAL_PRIORITY_CLASS` (priority 6). Relinquishes CPU time slices when game threads are contending for core cycles.

---

## 3. Windows 11 EcoQoS & Efficiency Cores

### What is EcoQoS?
Introduced in Windows 11 (Build 22000+), **EcoQoS** utilizes the `ProcessPowerThrottling` API:
```cpp
PROCESS_POWER_THROTTLING_STATE powerState;
powerState.Version = PROCESS_POWER_THROTTLING_CURRENT_VERSION;
powerState.ControlMask = PROCESS_POWER_THROTTLING_EXECUTION_SPEED;
powerState.StateMask = PROCESS_POWER_THROTTLING_EXECUTION_SPEED;
SetProcessInformation(hProcess, ProcessPowerThrottling, &powerState, sizeof(powerState));
```

### Why EcoQoS is Safe:
- Directs the Windows thread scheduler to bias background processes onto **Efficiency Cores (E-cores)**.
- Clamps CPU clock frequencies on background threads, significantly reducing thermal envelope consumption and leaving maximum thermal and electrical headroom for the GPU and Performance Cores (P-cores).
- **Invariants**: EcoQoS is **never** applied to the active game, foreground window, drivers, or security software.

---

## 4. Protected and Excluded Processes

OptiWinX maintains an immutable exclusion registry:

| Executable | Category | Reason for Permanent Protection |
| :--- | :--- | :--- |
| `smss.exe` | Session Manager | Critical Windows kernel bootstrap |
| `csrss.exe` | Client/Server Runtime | Thread creation and console subsystem |
| `wininit.exe` | Windows Initialization | Core service initialization |
| `winlogon.exe` | Windows Logon | Security credentials and user sessions |
| `services.exe` | Service Control Manager | Starts, stops, and manages system services |
| `lsass.exe` | Local Security Authority | Security tokens and authentication |
| `dwm.exe` | Desktop Window Manager | GPU compositing and window presentation |
| `MsMpEng.exe` | Windows Defender Core | Antivirus real-time scan engine |
| `audiodg.exe` | Windows Audio Graph | Audio processing engine (throttling causes pops) |

---

## 5. Why FPS Improvements Cannot Be Guaranteed

FPS is bounded by physical hardware limits, game engine architectural concurrency, API call overhead, thermal throttling, and resolution targets:
1. **GPU-Bound Scenarios**: If a graphics card is running at 99% load at 4K resolution, CPU priority tweaks produce **0 FPS difference**.
2. **Game Engine Bottlenecks**: Single-threaded render bottlenecks in older engines cannot be resolved by closing Discord or Spotify.
3. **Evidence-Based Honesty**: OptiWinX records baseline telemetry and compares post-optimization results. If no difference is detected, it states: *"No measurable improvement detected."*

---

## 6. Crash Recovery & Journal Guarantees

Every optimization is transactional:
- A write-ahead journal is maintained in `optiwin_recovery.journal`.
- If an unhandled exception or power outage occurs while optimizations are engaged, OptiWinX detects the incomplete transaction record on startup and issues Win32 restoration calls to restore processes to `NORMAL_PRIORITY_CLASS` and disable EcoQoS.
