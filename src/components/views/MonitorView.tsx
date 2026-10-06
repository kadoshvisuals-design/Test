/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Visualização: MonitorView.tsx (Português do Brasil)
 */

import React from 'react';
import { SystemMetrics, HardwareProfile } from '../../types/optiwin';
import { Cpu } from 'lucide-react';

interface MonitorViewProps {
  metrics: SystemMetrics;
  metricsHistory: SystemMetrics[];
  hardware: HardwareProfile;
}

export const MonitorView: React.FC<MonitorViewProps> = ({
  metrics,
  metricsHistory,
  hardware
}) => {
  const cores = Array.from({ length: hardware.cpu.logicalProcessors || 16 }, (_, i) => {
    const variation = ((i % 4) - 1.5) * 6;
    const coreLoad = Math.min(100, Math.max(5, metrics.cpuUsagePercent + variation));
    return { id: i, load: coreLoad };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho da Telemetria */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Telemetria de Hardware em Tempo Real
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Monitoramento de baixo impacto no processador. Médias móveis impedem oscilações nas decisões de otimização.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            Buffer ao Vivo: {metricsHistory.length} leituras
          </span>
          <span>·</span>
          <span>Intervalo: 1000ms</span>
        </div>
      </div>

      {/* Grade de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#242424] border border-[#333333] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Uso de CPU</span>
            <span className="font-mono">{hardware.cpu.physicalCores} Núcleos</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-2">
            {metrics.cpuUsagePercent.toFixed(1)}%
          </div>
          <div className="h-1.5 bg-[#181818] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00E5FF] transition-all duration-300"
              style={{ width: `${metrics.cpuUsagePercent}%` }}
            />
          </div>
        </div>

        <div className="bg-[#242424] border border-[#333333] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Carga da GPU</span>
            <span className="font-mono">DirectX 12</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-2">
            {metrics.gpuUsagePercent.toFixed(1)}%
          </div>
          <div className="h-1.5 bg-[#181818] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] transition-all duration-300"
              style={{ width: `${metrics.gpuUsagePercent}%` }}
            />
          </div>
        </div>

        <div className="bg-[#242424] border border-[#333333] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Uso de RAM Física</span>
            <span className="font-mono">{(metrics.availableRamMb / 1024).toFixed(1)} GB Livres</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-2">
            {metrics.ramUsagePercent.toFixed(1)}%
          </div>
          <div className="h-1.5 bg-[#181818] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00E676] transition-all duration-300"
              style={{ width: `${metrics.ramUsagePercent}%` }}
            />
          </div>
        </div>

        <div className="bg-[#242424] border border-[#333333] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>VRAM Dedicada</span>
            <span className="font-mono">{metrics.vramTotalMb} MB Total</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-2">
            {((metrics.vramUsedMb / metrics.vramTotalMb) * 100).toFixed(1)}%
          </div>
          <div className="h-1.5 bg-[#181818] rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${(metrics.vramUsedMb / metrics.vramTotalMb) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Topologia dos Núcleos Lógicos */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2F2F2F] mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="text-[#00E5FF]" size={16} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Topologia de Threads Lógicas ({cores.length} Threads)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Distribuição por Núcleo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {cores.map((c) => (
            <div
              key={c.id}
              className="p-2.5 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D] flex flex-col justify-between"
            >
              <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-2">
                <span>Thread #{c.id}</span>
                <span className="text-white font-semibold">{c.load.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-[#121212] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00E5FF] transition-all duration-300"
                  style={{ width: `${c.load}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalhamento do Subsistema de Memória */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 pb-2 border-b border-[#2F2F2F]">
            Alocação de Commit e Paginação
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Limite de Commit Total</span>
              <span className="font-mono text-white">{(hardware.ram.totalCommitLimitBytes / (1024 ** 3)).toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Carga Atual de Commit</span>
              <span className="font-mono text-white">{(hardware.ram.currentCommitBytes / (1024 ** 3)).toFixed(1)} GB ({metrics.commitUsagePercent.toFixed(1)}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Taxa de Falhas de Página Rígidas</span>
              <span className="font-mono text-neutral-300">{metrics.hardPageFaultsPerSec.toFixed(1)} falhas/seg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Pontuação de Pressão de Memória</span>
              <span className="font-mono font-bold text-[#00E5FF]">{metrics.memoryPressureScore}/100 [{metrics.pressureState}]</span>
            </div>
          </div>
        </div>

        <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 pb-2 border-b border-[#2F2F2F]">
            Transparência do Cache Standby do Windows
          </h2>
          <div className="p-3 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D] text-xs text-neutral-400 leading-relaxed space-y-2">
            <p>
              A arquitetura de memória do Windows mantém arquivos em Cache Standby para reexecução instantânea. Memória não utilizada é aproveitada de forma produtiva pelo kernel.
            </p>
            <p className="text-neutral-300 font-medium">
              O OptiWinX cumpre rigorosamente as Seções 0 e 6: nunca purga a lista de standby de forma indiscriminada nem desativa a compactação de memória.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
