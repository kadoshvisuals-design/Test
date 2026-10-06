/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Definições TypeScript em Português do Brasil (pt-BR)
 */

export type ElevationState = 'PADRÃO' | 'ADMINISTRADOR';

export type ProcessCategory = 
  | 'Sistema Crítico'
  | 'Núcleo do Windows'
  | 'Segurança'
  | 'Driver / Hardware'
  | 'Jogo Ativo'
  | 'Aplicativo em Primeiro Plano'
  | 'Aplicativo em Segundo Plano'
  | 'Inicializador de Jogos'
  | 'Utilitário do Sistema'
  | 'Desconhecido';

export type BottleneckType = 
  | 'LIMITADO POR CPU'
  | 'LIMITADO POR GPU'
  | 'PRESSÃO DE VRAM'
  | 'PRESSÃO DE RAM'
  | 'LIMITADO POR DISCO'
  | 'MISTO'
  | 'EQUILIBRADO'
  | 'DESCONHECIDO';

export type RiskLevel = 'BAIXO' | 'MÉDIO' | 'ALTO';

export type SafetyPolicy = 'SEGURO' | 'EQUILIBRADO' | 'PERSONALIZADO';

export type MemoryPressureState = 
  | 'NOMINAL'
  | 'PRESSÃO BAIXA'
  | 'PRESSÃO MODERADA'
  | 'PRESSÃO ALTA'
  | 'PRESSÃO CRÍTICA';

export type TransactionStatus = 
  | 'Pendente'
  | 'Aplicado'
  | 'Verificado'
  | 'Falhou'
  | 'Revertido'
  | 'Processo Inexistente';

export interface CpuInfo {
  name: string;
  architecture: string;
  physicalCores: number;
  logicalProcessors: number;
  baseFrequencyMhz: number;
  currentFrequencyMhz: number;
  cacheInfo: string;
  instructionSetAvx2: boolean;
  instructionSetAvx512: boolean;
}

export interface RamInfo {
  totalPhysicalBytes: number;
  availablePhysicalBytes: number;
  totalCommitLimitBytes: number;
  currentCommitBytes: number;
  memoryLoadPercent: number;
  pageFileBytes: number;
  isPressureDetected: boolean;
}

export interface GpuAdapterInfo {
  name: string;
  vendor: string;
  dedicatedVramBytes: number;
  sharedMemoryBytes: number;
  memoryBudgetBytes: number;
  driverVersion: string;
  isPrimary: boolean;
}

export interface OsInfo {
  osName: string;
  majorVersion: number;
  minorVersion: number;
  buildNumber: number;
  displayVersion: string;
  architecture: string;
  elevation: ElevationState;
  isWindows11: boolean;
  supportsEcoQoS: boolean;
}

export interface StorageDriveInfo {
  driveLetter: string;
  model: string;
  type: string;
  totalBytes: number;
  freeBytes: number;
}

export interface HardwareProfile {
  cpu: CpuInfo;
  ram: RamInfo;
  gpus: GpuAdapterInfo[];
  os: OsInfo;
  drives: StorageDriveInfo[];
  detectionTimestamp: string;
}

export interface SystemMetrics {
  cpuUsagePercent: number;
  perCoreUsage: number[];
  ramUsagePercent: number;
  commitUsagePercent: number;
  availableRamMb: number;
  gpuUsagePercent: number;
  vramUsedMb: number;
  vramTotalMb: number;
  hardPageFaultsPerSec: number;
  memoryPressureScore: number; // 0 - 100 normalizado
  pressureState: MemoryPressureState;
  timestamp: string;
}

export interface BottleneckDiagnosis {
  type: BottleneckType;
  confidencePercent: number;
  supportingReason: string;
  limitations: string;
  timestamp: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  path: string;
  category: ProcessCategory;
  cpuPercent: number;
  workingSetBytes: number;
  privateBytes: number;
  priorityClass: number;
  priorityName: 'OCIOSA' | 'ABAIXO DO NORMAL' | 'NORMAL' | 'ACIMA DO NORMAL' | 'ALTA' | 'TEMPO REAL';
  ecoQoSEnabled: boolean;
  isElevated: boolean;
  isProtected: boolean;
  isExcluded: boolean;
}

export interface TransactionEntry {
  transactionId: string;
  pid: number;
  processName: string;
  originalPriority: string;
  modifiedPriority: string;
  originalEcoQoS: boolean;
  modifiedEcoQoS: boolean;
  reason: string;
  risk: RiskLevel;
  status: TransactionStatus;
  timestamp: string;
  verificationResult: string;
}

export interface ProposedAction {
  pid: number;
  processName: string;
  category: ProcessCategory;
  currentPriority: string;
  proposedPriority: string;
  currentEcoQoS: boolean;
  proposedEcoQoS: boolean;
  reason: string;
  risk: RiskLevel;
  rollbackSupported: boolean;
}

export interface StartupEntry {
  name: string;
  command: string;
  source: string;
  isEnabled: boolean;
  risk: RiskLevel;
  recommendation: string;
}

export interface CleanupTarget {
  id: string;
  name: string;
  path: string;
  description: string;
  totalBytes: number;
  fileCount: number;
  requiresElevation: boolean;
  isSafe: boolean;
}

export interface CleanupResult {
  success: boolean;
  bytesFreed: number;
  filesDeleted: number;
  errorsEncountered: number;
  summary: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  processName: string;
  pid: number;
  previousState: string;
  newState: string;
  reason: string;
  risk: RiskLevel;
  verification: string;
  rollbackResult: string;
}
