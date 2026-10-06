/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Visualização: DashboardView.tsx (Português do Brasil)
 */

import React from 'react';
import { 
  HardwareProfile, 
  SystemMetrics, 
  BottleneckDiagnosis, 
  ProcessInfo 
} from '../../types/optiwin';
import { 
  Cpu, 
  Activity, 
  ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  hardware: HardwareProfile;
  metrics: SystemMetrics;
  diagnosis: BottleneckDiagnosis;
  processes: ProcessInfo[];
  isGamingModeActive: boolean;
  onToggleGamingMode: () => void;
  onRunAnalyze: () => void;
  onRunDryRun: () => void;
  onRunRollback: () => void;
  hasActiveRollback: boolean;
  onSwitchTab: (tab: any) => void;
  onTrimProcess: (pid: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  hardware,
  metrics,
  diagnosis,
  processes,
  isGamingModeActive,
  onToggleGamingMode,
  onRunAnalyze,
  onRunDryRun,
  onRunRollback,
  hasActiveRollback,
  onSwitchTab,
  onTrimProcess
}) => {
  const getPressureColor = (score: number) => {
    if (score < 50) return '#00E676'; // Verde
    if (score < 75) return '#FFB300'; // Âmbar
    return '#FF5252';                 // Vermelho
  };

  const pressureColor = getPressureColor(metrics.memoryPressureScore);

  const backgroundProcesses = processes
    .filter(p => p.category === 'Aplicativo em Segundo Plano')
    .slice(0, 5);

  const primaryGpu = hardware.gpus[0] || {
    name: 'Adaptador de Vídeo Padrão',
    dedicatedVramBytes: 8 * 1024 * 1024 * 1024
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Faixa Superior e Status do Sistema */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#00E5FF]">
              Diagnóstico e Integridade do Sistema
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-neutral-400">
              {hardware.os.osName} ({hardware.os.displayVersion})
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
            Painel Geral de Diagnóstico
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Telemetria autêntica sem métricas infladas. Regras estritas: sem prioridade de Tempo Real e sem purga forçada de cache standby.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={onRunAnalyze}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#2D2D2D] hover:bg-[#383838] text-white border border-[#444444] transition-colors cursor-pointer"
          >
            ANALISAR
          </button>
          <button
            onClick={onRunDryRun}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#2D2D2D] hover:bg-[#383838] text-white border border-[#444444] transition-colors cursor-pointer"
          >
            SIMULAR
          </button>
          <button
            onClick={onToggleGamingMode}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isGamingModeActive
                ? 'bg-[#00E5FF] text-black hover:bg-[#38EAFF]'
                : 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40 hover:bg-[#00E5FF]/20'
            }`}
          >
            {isGamingModeActive ? 'DESATIVAR MODO JOGO' : 'ATIVAR MODO JOGO'}
          </button>
          <button
            onClick={onRunRollback}
            disabled={!hasActiveRollback}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              hasActiveRollback
                ? 'bg-[#2D2D2D] border-[#FFB300] text-[#FFB300] hover:bg-[#FFB300]/10'
                : 'bg-[#1E1E1E] border-[#333333] text-neutral-600 cursor-not-allowed opacity-60'
            }`}
          >
            REVERTER
          </button>
        </div>
      </div>

      {/* 2. Seção de Perfil de Hardware (Seção 21) */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2F2F2F]">
          <div className="flex items-center gap-2">
            <Cpu className="text-[#00E5FF]" size={16} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Perfil de Hardware Detectado
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Identificado via Win32, CPUID e DXGI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#1E1E1E] border border-[#2B2B2B]">
            <span className="text-neutral-500 block mb-1">Processador (CPU)</span>
            <p className="font-semibold text-white truncate" title={hardware.cpu.name}>
              {hardware.cpu.name}
            </p>
            <div className="text-neutral-400 font-mono text-[11px] mt-1.5 flex items-center gap-2">
              <span>{hardware.cpu.physicalCores} Núcleos / {hardware.cpu.logicalProcessors} Threads</span>
              <span>·</span>
              <span className="text-[#00E5FF]">{hardware.cpu.currentFrequencyMhz} MHz</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#1E1E1E] border border-[#2B2B2B]">
            <span className="text-neutral-500 block mb-1">Placa de Vídeo (GPU)</span>
            <p className="font-semibold text-white truncate" title={primaryGpu.name}>
              {primaryGpu.name}
            </p>
            <div className="text-neutral-400 font-mono text-[11px] mt-1.5 flex items-center gap-2">
              <span>{(primaryGpu.dedicatedVramBytes / (1024 ** 3)).toFixed(1)} GB VRAM Dedicada</span>
              <span>·</span>
              <span className="text-[#00E5FF]">DXGI 12</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#1E1E1E] border border-[#2B2B2B]">
            <span className="text-neutral-500 block mb-1">Memória RAM Física</span>
            <p className="font-semibold text-white">
              {(hardware.ram.totalPhysicalBytes / (1024 ** 3)).toFixed(1)} GB Total
            </p>
            <div className="text-neutral-400 font-mono text-[11px] mt-1.5 flex items-center gap-2">
              <span>{(metrics.availableRamMb / 1024).toFixed(1)} GB Disponível</span>
              <span>·</span>
              <span className="text-neutral-300">{metrics.ramUsagePercent.toFixed(0)}% em Uso</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#1E1E1E] border border-[#2B2B2B]">
            <span className="text-neutral-500 block mb-1">Unidade de Armazenamento</span>
            <p className="font-semibold text-white truncate">
              {hardware.drives[0]?.model || 'SSD NVMe'}
            </p>
            <div className="text-neutral-400 font-mono text-[11px] mt-1.5 flex items-center gap-2">
              <span>{hardware.drives[0]?.driveLetter || 'C:'}</span>
              <span>·</span>
              <span className="text-[#00E676]">
                {((hardware.drives[0]?.freeBytes || 0) / (1024 ** 3)).toFixed(0)} GB Livres
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Medidores em Tempo Real e Diagnóstico de Gargalos (Seção 21 e 22) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Esquerda: 2 Colunas de Medidores */}
        <div className="lg:col-span-2 bg-[#242424] border border-[#333333] rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#2F2F2F]">
            <div className="flex items-center gap-2">
              <Activity className="text-[#00E5FF]" size={16} />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Indicadores de Carga do Sistema
              </h2>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">
              Taxa de Leitura: 1000ms com Histerese
            </span>
          </div>

          <div className="space-y-4">
            {/* Medidor de Uso de CPU */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-neutral-300 font-medium">Uso do Processador (CPU)</span>
                <span className="font-mono tabular-nums text-white font-semibold">
                  {metrics.cpuUsagePercent.toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 bg-[#181818] rounded-full overflow-hidden border border-[#2C2C2C]">
                <div
                  className="h-full bg-linear-to-r from-[#00E5FF] to-[#00B4D8] transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, metrics.cpuUsagePercent))}%` }}
                />
              </div>
            </div>

            {/* Medidor de Uso de GPU */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-neutral-300 font-medium">Uso do Chip Gráfico (GPU)</span>
                <span className="font-mono tabular-nums text-white font-semibold">
                  {metrics.gpuUsagePercent.toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 bg-[#181818] rounded-full overflow-hidden border border-[#2C2C2C]">
                <div
                  className="h-full bg-linear-to-r from-[#00E5FF] to-[#3B82F6] transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, metrics.gpuUsagePercent))}%` }}
                />
              </div>
            </div>

            {/* Medidor de Uso de VRAM */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-neutral-300 font-medium">Memória de Vídeo Dedicada (VRAM)</span>
                <span className="font-mono tabular-nums text-white font-semibold">
                  {metrics.vramUsedMb} / {metrics.vramTotalMb} MB (
                  {((metrics.vramUsedMb / metrics.vramTotalMb) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2.5 bg-[#181818] rounded-full overflow-hidden border border-[#2C2C2C]">
                <div
                  className="h-full bg-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${(metrics.vramUsedMb / metrics.vramTotalMb) * 100}%` }}
                />
              </div>
            </div>

            {/* Pontuação de Pressão de Memória (Seção 6 e 23: 0 a 100) */}
            <div className="p-4 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-300">
                    Pressão Adaptativa de Memória
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border"
                    style={{
                      color: pressureColor,
                      borderColor: `${pressureColor}40`,
                      backgroundColor: `${pressureColor}15`
                    }}
                  >
                    {metrics.pressureState}
                  </span>
                </div>
                <span
                  className="text-base font-mono font-bold tabular-nums"
                  style={{ color: pressureColor }}
                >
                  {metrics.memoryPressureScore} / 100
                </span>
              </div>

              <div className="h-3 bg-[#121212] rounded-full overflow-hidden border border-[#2A2A2A] mb-2">
                <div
                  className="h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${metrics.memoryPressureScore}%`,
                    backgroundColor: pressureColor
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                <span>0 NOMINAL</span>
                <span>40 BAIXA</span>
                <span>60 MODERADA</span>
                <span>75 ALTA</span>
                <span>100 CRÍTICA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direita: Diagnóstico de Gargalos (Seção 10 e 22) */}
        <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2F2F2F] mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Diagnóstico de Gargalo
              </span>
              <span className="text-[11px] font-mono text-[#00E5FF]">
                Confiança: {diagnosis.confidencePercent}%
              </span>
            </div>

            <div className="mb-4">
              <div className="text-xs text-neutral-400 mb-1">Estado de Desempenho</div>
              <div className="text-xl font-bold font-mono text-white flex items-center gap-2">
                <span className="text-[#00E5FF]">{diagnosis.type}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D]">
                <span className="text-neutral-500 font-semibold block mb-1">Evidências da Telemetria:</span>
                <p className="text-neutral-300 leading-relaxed">
                  {diagnosis.supportingReason}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D]">
                <span className="text-neutral-500 font-semibold block mb-1">Limitações Técnicas:</span>
                <p className="text-neutral-400 leading-relaxed">
                  {diagnosis.limitations}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2F2F2F] mt-4 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">Atualizado: {diagnosis.timestamp}</span>
            <button
              onClick={() => onSwitchTab('bottlenecks')}
              className="text-[#00E5FF] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              Ver Detalhes do Gargalo <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Tabela de Candidatos a Otimização (Seção 21) */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2F2F2F] mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-[#00E5FF]" size={16} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Candidatos a Otimização em Segundo Plano
            </h2>
          </div>
          <button
            onClick={() => onSwitchTab('processes')}
            className="text-xs text-[#00E5FF] hover:underline font-medium cursor-pointer"
          >
            Gerenciar Todos os Processos ({processes.length}) &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#2E2E2E] text-neutral-500 font-mono">
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">Nome do Executável</th>
                <th className="py-2.5 px-3">Classificação</th>
                <th className="py-2.5 px-3 text-right">CPU %</th>
                <th className="py-2.5 px-3 text-right">Memória (Working Set)</th>
                <th className="py-2.5 px-3">Prioridade</th>
                <th className="py-2.5 px-3">EcoQoS</th>
                <th className="py-2.5 px-3 text-right">Ação Segura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {backgroundProcesses.map((proc) => (
                <tr key={proc.pid} className="hover:bg-[#2A2A2A]/50 transition-colors">
                  <td className="py-3 px-3 font-mono text-neutral-400 tabular-nums">
                    {proc.pid}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {proc.name}
                  </td>
                  <td className="py-3 px-3 text-neutral-400">
                    {proc.category}
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-right text-neutral-300">
                    {proc.cpuPercent.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-right text-neutral-300">
                    {(proc.workingSetBytes / (1024 * 1024)).toFixed(0)} MB
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-neutral-400">
                    {proc.priorityName}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        proc.ecoQoSEnabled
                          ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {proc.ecoQoSEnabled ? 'ATIVO' : 'DESATIVADO'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onTrimProcess(proc.pid)}
                      title="Solicita redução segura do conjunto de trabalho mantendo estabilidade"
                      className="px-2.5 py-1 text-[11px] font-medium rounded bg-[#2E2E2E] hover:bg-[#383838] text-neutral-200 border border-[#444444] transition-colors cursor-pointer"
                    >
                      Reduzir Memória
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
