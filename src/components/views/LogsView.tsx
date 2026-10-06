/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Visualização: LogsView.tsx (Português do Brasil)
 */

import React from 'react';
import { LogEntry } from '../../types/optiwin';
import { FileText } from 'lucide-react';

interface LogsViewProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Auditoria e Registros de Modificações do Sistema
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Seção 24: Toda alteração realizada no sistema é documentada com data/hora, transições de estado, motivo técnico e resultado da verificação.
          </p>
        </div>
        <button
          onClick={onClearLogs}
          className="px-3.5 py-1.5 text-xs font-mono rounded bg-[#1C1C1C] hover:bg-[#282828] text-neutral-300 border border-[#333333] transition-colors cursor-pointer self-start md:self-auto"
        >
          Limpar Registros em Memória
        </button>
      </div>

      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2F2F2F] mb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-[#00E5FF]" size={16} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Fluxo Contínuo de Auditoria ({logs.length} eventos)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Trilha Imutável de Transações
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            Nenhum evento registrado no momento. Execute a Análise, Simulação ou Modo Jogo para gerar novas entradas.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D] text-xs font-mono space-y-2 hover:border-[#383838] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-neutral-400 gap-1 border-b border-[#252525] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00E5FF] font-bold">[{log.timestamp}]</span>
                    <span className="text-white font-semibold">{log.action}</span>
                    <span className="text-neutral-500">&bull;</span>
                    <span className="text-neutral-300 font-sans font-medium">{log.processName} (PID {log.pid})</span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold self-start sm:self-auto ${
                      log.risk === 'BAIXO'
                        ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                        : log.risk === 'MÉDIO'
                        ? 'bg-[#FFB300]/10 text-[#FFB300] border border-[#FFB300]/30'
                        : 'bg-red-900/30 text-red-400 border border-red-800/40'
                    }`}
                  >
                    Risco: {log.risk}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-neutral-300">
                  <div>
                    <span className="text-neutral-500">Transição: </span>
                    <span className="text-neutral-400">{log.previousState}</span> &rarr; <span className="text-[#00E5FF]">{log.newState}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Verificação: </span>
                    <span className="text-[#00E676]">{log.verification}</span>
                  </div>
                </div>

                <div className="text-neutral-400 font-sans pt-1">
                  <span className="text-neutral-500 font-mono">Motivo Técnico: </span>
                  {log.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
