/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Visualização: BottleneckView.tsx (Português do Brasil)
 */

import React from 'react';
import { BottleneckDiagnosis, SystemMetrics } from '../../types/optiwin';

interface BottleneckViewProps {
  diagnosis: BottleneckDiagnosis;
  metrics: SystemMetrics;
  onSimulateWorkload: (type: 'gpu' | 'cpu' | 'ram' | 'balanced') => void;
}

export const BottleneckView: React.FC<BottleneckViewProps> = ({
  diagnosis,
  metrics,
  onSimulateWorkload
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Análise Avançada de Gargalos
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Diagnóstico de carga em tempo real. Avaliação cruzada de métricas para evitar falsos diagnósticos.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-neutral-400 mr-2">Simular Cenário:</span>
          <button
            onClick={() => onSimulateWorkload('gpu')}
            className="px-2.5 py-1 text-xs font-mono rounded bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#333333] cursor-pointer"
          >
            GPU Saturação
          </button>
          <button
            onClick={() => onSimulateWorkload('cpu')}
            className="px-2.5 py-1 text-xs font-mono rounded bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#333333] cursor-pointer"
          >
            CPU Saturação
          </button>
          <button
            onClick={() => onSimulateWorkload('ram')}
            className="px-2.5 py-1 text-xs font-mono rounded bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#333333] cursor-pointer"
          >
            Pressão de RAM
          </button>
          <button
            onClick={() => onSimulateWorkload('balanced')}
            className="px-2.5 py-1 text-xs font-mono rounded bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#333333] cursor-pointer"
          >
            Equilibrado
          </button>
        </div>
      </div>

      {/* Cartão Principal de Diagnóstico */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#2E2E2E] gap-4 mb-6">
          <div>
            <span className="text-xs font-mono uppercase text-neutral-500 block mb-1">
              Classificação Ativa do Gargalo
            </span>
            <div className="text-2xl md:text-3xl font-mono font-bold text-white flex items-center gap-3">
              <span className="text-[#00E5FF]">{diagnosis.type}</span>
              <span className="text-xs font-sans font-medium px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                Grau de Confiança: {diagnosis.confidencePercent}%
              </span>
            </div>
          </div>

          <div className="text-xs font-mono text-neutral-400">
            Horário da Leitura: {diagnosis.timestamp}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Medições e Evidências Técnicas
            </h3>
            <div className="p-4 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D] text-xs text-neutral-300 leading-relaxed">
              {diagnosis.supportingReason}
            </div>

            <div className="p-4 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D] space-y-2 text-xs">
              <span className="text-neutral-500 font-semibold block">Telemetria Correlacionada:</span>
              <div className="flex justify-between text-neutral-300 font-mono">
                <span>Carga de CPU:</span>
                <span>{metrics.cpuUsagePercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-neutral-300 font-mono">
                <span>Carga da GPU:</span>
                <span>{metrics.gpuUsagePercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-neutral-300 font-mono">
                <span>VRAM Dedicada:</span>
                <span>{metrics.vramUsedMb} / {metrics.vramTotalMb} MB</span>
              </div>
              <div className="flex justify-between text-neutral-300 font-mono">
                <span>Pressão de Memória:</span>
                <span>{metrics.memoryPressureScore}/100</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Limitações da Arquitetura e Transparência (Seção 10)
            </h3>
            <div className="p-4 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D] text-xs text-neutral-400 leading-relaxed">
              <p className="mb-2">
                <strong className="text-neutral-300">Restrição Identificada: </strong>
                {diagnosis.limitations}
              </p>
              <p>
                O OptiWinX cumpre rigorosamente a Seção 10: nunca declara 100% de certeza absoluta quando a telemetria é limitada por camadas de abstração de drivers dos fabricantes.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D] text-xs space-y-2 text-neutral-400">
              <span className="text-neutral-300 font-semibold block">Critérios de Avaliação:</span>
              <p>• Limitado por GPU: Carga da GPU &ge; 88% sustentada com CPU &le; 75%.</p>
              <p>• Limitado por CPU: Carga da CPU &ge; 85% sustentada com GPU &le; 70%.</p>
              <p>• Pressão de VRAM: VRAM dedicada &ge; 92% da capacidade da placa.</p>
              <p>• Pressão de RAM: Índice de pressão de memória &ge; 80/100 sustentado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
