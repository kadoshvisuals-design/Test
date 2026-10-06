/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Motor de Simulação e Algoritmos de Diagnóstico em Português do Brasil (pt-BR)
 */

import {
  HardwareProfile,
  SystemMetrics,
  BottleneckDiagnosis,
  ProcessInfo,
  TransactionEntry,
  ProposedAction,
  StartupEntry,
  CleanupTarget,
  LogEntry,
  MemoryPressureState,
  SafetyPolicy
} from '../types/optiwin';

// Auxiliar de carimbo de data/hora
export const getNowTimestamp = (): string => {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
};

export const defaultHardwareProfile: HardwareProfile = {
  cpu: {
    name: 'AMD Ryzen 7 5800X (8 Núcleos / 16 Threads)',
    architecture: 'x64 (Zen 3)',
    physicalCores: 8,
    logicalProcessors: 16,
    baseFrequencyMhz: 3800,
    currentFrequencyMhz: 4650,
    cacheInfo: 'L1: 512 KB | L2: 4 MB | L3: 32 MB Unificado',
    instructionSetAvx2: true,
    instructionSetAvx512: false
  },
  ram: {
    totalPhysicalBytes: 32 * 1024 * 1024 * 1024,
    availablePhysicalBytes: 15.4 * 1024 * 1024 * 1024,
    totalCommitLimitBytes: 36 * 1024 * 1024 * 1024,
    currentCommitBytes: 18.2 * 1024 * 1024 * 1024,
    memoryLoadPercent: 52,
    pageFileBytes: 4 * 1024 * 1024 * 1024,
    isPressureDetected: false
  },
  gpus: [
    {
      name: 'NVIDIA GeForce RTX 4070 Ti (12 GB GDDR6X)',
      vendor: 'NVIDIA Corporation',
      dedicatedVramBytes: 12 * 1024 * 1024 * 1024,
      sharedMemoryBytes: 16 * 1024 * 1024 * 1024,
      memoryBudgetBytes: 11.2 * 1024 * 1024 * 1024,
      driverVersion: 'GeForce Game Ready Driver 551.86 (WDDM 3.1)',
      isPrimary: true
    }
  ],
  os: {
    osName: 'Microsoft Windows 11 Pro 64 bits',
    majorVersion: 10,
    minorVersion: 0,
    buildNumber: 22631,
    displayVersion: 'Versão 23H2 (Compilação 22631.3296)',
    architecture: 'Sistema Operacional de 64 bits, processador baseado em x64',
    elevation: 'ADMINISTRADOR',
    isWindows11: true,
    supportsEcoQoS: true
  },
  drives: [
    {
      driveLetter: 'C:',
      model: 'Samsung SSD 980 PRO 1TB (NVMe PCIe 4.0)',
      type: 'Unidade de Estado Sólido NVMe (SSD)',
      totalBytes: 1000 * 1024 * 1024 * 1024,
      freeBytes: 420 * 1024 * 1024 * 1024
    },
    {
      driveLetter: 'D:',
      model: 'Crucial P3 Plus 2TB (NVMe PCIe 4.0)',
      type: 'Unidade de Estado Sólido NVMe (SSD)',
      totalBytes: 2000 * 1024 * 1024 * 1024,
      freeBytes: 1140 * 1024 * 1024 * 1024
    }
  ],
  detectionTimestamp: '2026-10-06 12:00:00'
};

export const initialProcesses: ProcessInfo[] = [
  {
    pid: 4120,
    name: 'Cyberpunk2077.exe',
    path: 'D:\\Jogos\\Cyberpunk 2077\\bin\\x64\\Cyberpunk2077.exe',
    category: 'Jogo Ativo',
    cpuPercent: 44.5,
    workingSetBytes: 4280 * 1024 * 1024,
    privateBytes: 4150 * 1024 * 1024,
    priorityClass: 0x00000020,
    priorityName: 'NORMAL',
    ecoQoSEnabled: false,
    isElevated: true,
    isProtected: false,
    isExcluded: false
  },
  {
    pid: 8244,
    name: 'chrome.exe',
    path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    category: 'Aplicativo em Segundo Plano',
    cpuPercent: 12.8,
    workingSetBytes: 1420 * 1024 * 1024,
    privateBytes: 1210 * 1024 * 1024,
    priorityClass: 0x00000020,
    priorityName: 'NORMAL',
    ecoQoSEnabled: false,
    isElevated: false,
    isProtected: false,
    isExcluded: false
  },
  {
    pid: 9188,
    name: 'Discord.exe',
    path: 'C:\\Users\\Usuario\\AppData\\Local\\Discord\\app-1.0.9142\\Discord.exe',
    category: 'Aplicativo em Segundo Plano',
    cpuPercent: 3.4,
    workingSetBytes: 430 * 1024 * 1024,
    privateBytes: 390 * 1024 * 1024,
    priorityClass: 0x00000020,
    priorityName: 'NORMAL',
    ecoQoSEnabled: false,
    isElevated: false,
    isProtected: false,
    isExcluded: false
  },
  {
    pid: 6044,
    name: 'Spotify.exe',
    path: 'C:\\Users\\Usuario\\AppData\\Roaming\\Spotify\\Spotify.exe',
    category: 'Aplicativo em Segundo Plano',
    cpuPercent: 2.1,
    workingSetBytes: 290 * 1024 * 1024,
    privateBytes: 260 * 1024 * 1024,
    priorityClass: 0x00000020,
    priorityName: 'NORMAL',
    ecoQoSEnabled: false,
    isElevated: false,
    isProtected: false,
    isExcluded: false
  },
  {
    pid: 3390,
    name: 'Steam.exe',
    path: 'C:\\Program Files (x86)\\Steam\\steam.exe',
    category: 'Inicializador de Jogos',
    cpuPercent: 1.5,
    workingSetBytes: 240 * 1024 * 1024,
    privateBytes: 210 * 1024 * 1024,
    priorityClass: 0x00000020,
    priorityName: 'NORMAL',
    ecoQoSEnabled: false,
    isElevated: false,
    isProtected: false,
    isExcluded: false
  },
  {
    pid: 512,
    name: 'dwm.exe',
    path: 'C:\\Windows\\System32\\dwm.exe',
    category: 'Sistema Crítico',
    cpuPercent: 1.8,
    workingSetBytes: 180 * 1024 * 1024,
    privateBytes: 150 * 1024 * 1024,
    priorityClass: 0x00000080,
    priorityName: 'ALTA',
    ecoQoSEnabled: false,
    isElevated: true,
    isProtected: true,
    isExcluded: true
  },
  {
    pid: 1104,
    name: 'MsMpEng.exe',
    path: 'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\MsMpEng.exe',
    category: 'Segurança',
    cpuPercent: 0.9,
    workingSetBytes: 280 * 1024 * 1024,
    privateBytes: 240 * 1024 * 1024,
    priorityClass: 0x00000020,
    priorityName: 'NORMAL',
    ecoQoSEnabled: false,
    isElevated: true,
    isProtected: true,
    isExcluded: true
  },
  {
    pid: 748,
    name: 'services.exe',
    path: 'C:\\Windows\\System32\\services.exe',
    category: 'Sistema Crítico',
    cpuPercent: 0.1,
    workingSetBytes: 45 * 1024 * 1024,
    privateBytes: 30 * 1024 * 1024,
    priorityClass: 0x00000080,
    priorityName: 'ALTA',
    ecoQoSEnabled: false,
    isElevated: true,
    isProtected: true,
    isExcluded: true
  },
  {
    pid: 800,
    name: 'lsass.exe',
    path: 'C:\\Windows\\System32\\lsass.exe',
    category: 'Sistema Crítico',
    cpuPercent: 0.2,
    workingSetBytes: 52 * 1024 * 1024,
    privateBytes: 38 * 1024 * 1024,
    priorityClass: 0x00000080,
    priorityName: 'ALTA',
    ecoQoSEnabled: false,
    isElevated: true,
    isProtected: true,
    isExcluded: true
  },
  {
    pid: 2240,
    name: 'nvcontainer.exe',
    path: 'C:\\Program Files\\NVIDIA Corporation\\NvContainer\\nvcontainer.exe',
    category: 'Driver / Hardware',
    cpuPercent: 0.4,
    workingSetBytes: 68 * 1024 * 1024,
    privateBytes: 45 * 1024 * 1024,
    priorityClass: 0x00000020,
    priorityName: 'NORMAL',
    ecoQoSEnabled: false,
    isElevated: true,
    isProtected: true,
    isExcluded: true
  }
];

export const initialStartupEntries: StartupEntry[] = [
  {
    name: 'Discord',
    command: 'C:\\Users\\Usuario\\AppData\\Local\\Discord\\app.exe',
    source: 'HKCU\\Run',
    isEnabled: true,
    risk: 'BAIXO',
    recommendation: 'Cliente de comunicação em segundo plano. Seguro para desativar e acelerar a inicialização.'
  },
  {
    name: 'Steam',
    command: '"C:\\Program Files (x86)\\Steam\\steam.exe" -silent',
    source: 'HKCU\\Run',
    isEnabled: true,
    risk: 'BAIXO',
    recommendation: 'Gerenciador de jogos. Seguro para desativar; inicie manualmente ao jogar.'
  },
  {
    name: 'Spotify',
    command: 'C:\\Users\\Usuario\\AppData\\Roaming\\Spotify\\Spotify.exe --autostart',
    source: 'HKCU\\Run',
    isEnabled: true,
    risk: 'BAIXO',
    recommendation: 'Inicialização automática do reprodutor de música. Seguro para desativar.'
  },
  {
    name: 'SecurityHealth',
    command: '%windir%\\system32\\SecurityHealthSystray.exe',
    source: 'HKLM\\Run',
    isEnabled: true,
    risk: 'ALTO',
    recommendation: 'Notificações da Segurança do Windows. Mantenha sempre ativado.'
  },
  {
    name: 'RtkAudUService',
    command: '"C:\\Program Files\\Realtek\\Audio\\RtkAudUService64.exe" -autorun',
    source: 'HKLM\\Run',
    isEnabled: true,
    risk: 'MÉDIO',
    recommendation: 'Serviço de suporte do driver de áudio Realtek. Recomenda-se manter ativado.'
  }
];

export const initialCleanupTargets: CleanupTarget[] = [
  {
    id: 'user_temp',
    name: 'Arquivos Temporários do Usuário (%TEMP%)',
    path: 'C:\\Users\\Usuario\\AppData\\Local\\Temp',
    description: 'Arquivos residuais de programas, descompactações de instaladores e buffers de navegação.',
    totalBytes: 840 * 1024 * 1024,
    fileCount: 412,
    requiresElevation: false,
    isSafe: true
  },
  {
    id: 'win_temp',
    name: 'Arquivos Temporários do Sistema Windows',
    path: 'C:\\Windows\\Temp',
    description: 'Arquivos temporários e logs de instalação de drivers do sistema. Requer permissão de administrador.',
    totalBytes: 520 * 1024 * 1024,
    fileCount: 168,
    requiresElevation: true,
    isSafe: true
  },
  {
    id: 'crash_dumps',
    name: 'Relatórios de Falhas de Aplicativos (Dumps)',
    path: 'C:\\Users\\Usuario\\AppData\\Local\\CrashDumps',
    description: 'Arquivos de despejo de memória (.dmp) criados quando programas fecham inesperadamente.',
    totalBytes: 310 * 1024 * 1024,
    fileCount: 6,
    requiresElevation: false,
    isSafe: true
  },
  {
    id: 'shader_cache',
    name: 'Cache de Shaders DirectX Residual',
    path: 'C:\\Users\\Usuario\\AppData\\Local\\D3DSCache',
    description: 'Binários pré-compilados de shaders. Seguro para redefinir caso jogos apresentem artefatos visuais.',
    totalBytes: 450 * 1024 * 1024,
    fileCount: 88,
    requiresElevation: false,
    isSafe: true
  }
];

// Cálculo normalizado da pontuação de pressão de memória [0 a 100] (Seção 6)
export const calculateMemoryPressure = (
  ramUsagePercent: number,
  commitUsagePercent: number,
  hardFaultsPerSec: number
): { score: number; state: MemoryPressureState } => {
  // Carga física (45%) + Carga de Commit (40%) + Taxa de falhas de página (15%)
  const physicalComponent = Math.min(Math.max(ramUsagePercent, 0), 100) * 0.45;
  const commitComponent = Math.min(Math.max(commitUsagePercent, 0), 100) * 0.40;
  const faultComponent = Math.min(Math.max(hardFaultsPerSec * 3.0, 0), 15.0);
  const rawScore = physicalComponent + commitComponent + faultComponent;
  const score = Math.round(Math.min(Math.max(rawScore, 0), 100));

  let state: MemoryPressureState = 'NOMINAL';
  if (score < 40) state = 'NOMINAL';
  else if (score < 60) state = 'PRESSÃO BAIXA';
  else if (score < 75) state = 'PRESSÃO MODERADA';
  else if (score < 90) state = 'PRESSÃO ALTA';
  else state = 'PRESSÃO CRÍTICA';

  return { score, state };
};

// Algoritmo de Diagnóstico de Gargalos (Seção 10)
export const analyzeBottleneck = (metrics: SystemMetrics): BottleneckDiagnosis => {
  const vramRatio = metrics.vramTotalMb > 0 ? metrics.vramUsedMb / metrics.vramTotalMb : 0;

  if (vramRatio >= 0.92) {
    return {
      type: 'PRESSÃO DE VRAM',
      confidencePercent: Math.min(98, Math.round(85 + (vramRatio - 0.92) * 100)),
      supportingReason: `O uso de VRAM dedicada está próximo do limite (${metrics.vramUsedMb} / ${metrics.vramTotalMb} MB, ${(vramRatio * 100).toFixed(1)}%). O fluxo gráfico está aguardando a paginação de texturas.`,
      limitations: 'A profundidade da fila de paginação WDDM é restrita pelo driver da placa de vídeo.',
      timestamp: metrics.timestamp
    };
  }

  if (metrics.memoryPressureScore >= 80 || (metrics.ramUsagePercent >= 88 && metrics.commitUsagePercent >= 85)) {
    return {
      type: 'PRESSÃO DE RAM',
      confidencePercent: Math.min(95, Math.round(75 + (metrics.memoryPressureScore - 75) * 1.3)),
      supportingReason: `Pontuação de pressão de memória sustentada em ${metrics.memoryPressureScore}/100. Uso de RAM física em ${metrics.ramUsagePercent.toFixed(1)}% e carga de alocação de Commit em ${metrics.commitUsagePercent.toFixed(1)}%.`,
      limitations: 'A taxa de compressão de memória interna do Windows não é discriminada pelo driver de modo usuário.',
      timestamp: metrics.timestamp
    };
  }

  if (metrics.gpuUsagePercent >= 88 && metrics.cpuUsagePercent <= 75) {
    const spread = metrics.gpuUsagePercent - metrics.cpuUsagePercent;
    return {
      type: 'LIMITADO POR GPU',
      confidencePercent: Math.min(96, Math.max(80, Math.round(80 + spread * 0.5))),
      supportingReason: `A utilização da GPU permaneceu contínua em ${metrics.gpuUsagePercent.toFixed(1)}% enquanto a CPU operou em ${metrics.cpuUsagePercent.toFixed(1)}%. A fila de renderização gráfica está completamente saturada.`,
      limitations: 'Os estágios de rasterização e filas de computação assíncrona não são diferenciados individualmente.',
      timestamp: metrics.timestamp
    };
  }

  if (metrics.cpuUsagePercent >= 85 && metrics.gpuUsagePercent <= 70) {
    const spread = metrics.cpuUsagePercent - metrics.gpuUsagePercent;
    return {
      type: 'LIMITADO POR CPU',
      confidencePercent: Math.min(95, Math.max(80, Math.round(80 + spread * 0.5))),
      supportingReason: `O uso da CPU permaneceu alto em ${metrics.cpuUsagePercent.toFixed(1)}% enquanto a GPU operou em ${metrics.gpuUsagePercent.toFixed(1)}%. A thread principal do jogo ou o envio de draw calls está saturando os núcleos.`,
      limitations: 'A frequência de troca de contexto por thread requer captura detalhada via ETW.',
      timestamp: metrics.timestamp
    };
  }

  if (metrics.cpuUsagePercent >= 80 && metrics.gpuUsagePercent >= 80) {
    return {
      type: 'MISTO',
      confidencePercent: 88,
      supportingReason: `Alta carga simultânea tanto na CPU (${metrics.cpuUsagePercent.toFixed(1)}%) quanto na GPU (${metrics.gpuUsagePercent.toFixed(1)}%). Carga de trabalho pesada e equilibrada.`,
      limitations: 'Ambos os componentes estão próximos do limite de envelope térmico ou consumo elétrico.',
      timestamp: metrics.timestamp
    };
  }

  return {
    type: 'EQUILIBRADO',
    confidencePercent: 91,
    supportingReason: `Distribuição balanceada de recursos com folga adequada na CPU (${metrics.cpuUsagePercent.toFixed(1)}%), GPU (${metrics.gpuUsagePercent.toFixed(1)}%) e memória (Pontuação: ${metrics.memoryPressureScore}/100).`,
    limitations: 'Variações de frametime em milissegundos não são avaliadas em intervalos curtos.',
    timestamp: metrics.timestamp
  };
};

// Planejamento de ações propostas sem modificações no sistema (Seção 19: SIMULAÇÃO / DRY-RUN)
export const planDryRunOptimizations = (
  processes: ProcessInfo[],
  policy: SafetyPolicy
): ProposedAction[] => {
  const actions: ProposedAction[] = [];
  const game = processes.find(p => p.category === 'Jogo Ativo');

  if (game) {
    actions.push({
      pid: game.pid,
      processName: game.name,
      category: 'Jogo Ativo',
      currentPriority: game.priorityName,
      proposedPriority: 'ACIMA DO NORMAL',
      currentEcoQoS: game.ecoQoSEnabled,
      proposedEcoQoS: false,
      reason: 'Priorizar o agendamento da thread principal de renderização (ACIMA DO NORMAL). Nunca aplicar EcoQoS ao jogo ativo.',
      risk: 'BAIXO',
      rollbackSupported: true
    });
  }

  for (const p of processes) {
    if (game && p.pid === game.pid) continue;
    if (p.isExcluded || p.isProtected) continue;

    if (p.category === 'Aplicativo em Segundo Plano') {
      if (policy === 'SEGURO') {
        actions.push({
          pid: p.pid,
          processName: p.name,
          category: 'Aplicativo em Segundo Plano',
          currentPriority: p.priorityName,
          proposedPriority: p.priorityName,
          currentEcoQoS: p.ecoQoSEnabled,
          proposedEcoQoS: true,
          reason: 'Modulação de eficiência via Windows 11 EcoQoS para minimizar a disputa de ciclos de clock com o jogo.',
          risk: 'BAIXO',
          rollbackSupported: true
        });
      } else if (policy === 'EQUILIBRADO' || policy === 'PERSONALIZADO') {
        actions.push({
          pid: p.pid,
          processName: p.name,
          category: 'Aplicativo em Segundo Plano',
          currentPriority: p.priorityName,
          proposedPriority: 'ABAIXO DO NORMAL',
          currentEcoQoS: p.ecoQoSEnabled,
          proposedEcoQoS: true,
          reason: 'Ajustar prioridade para ABAIXO DO NORMAL e ativar EcoQoS para evitar engasgos (stuttering) durante partidas ativas.',
          risk: 'BAIXO',
          rollbackSupported: true
        });
      }
    }
  }

  return actions;
};
