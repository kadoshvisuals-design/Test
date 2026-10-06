/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Visualização: StartupCleanupView.tsx (Português do Brasil)
 */

import React, { useState } from 'react';
import { StartupEntry, CleanupTarget, CleanupResult } from '../../types/optiwin';
import { RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';

interface StartupCleanupViewProps {
  startupEntries: StartupEntry[];
  onToggleStartup: (name: string, enable: boolean) => void;
  cleanupTargets: CleanupTarget[];
  onExecuteCleanup: (selectedIds: string[]) => void;
  cleanupResult: CleanupResult | null;
}

export const StartupCleanupView: React.FC<StartupCleanupViewProps> = ({
  startupEntries,
  onToggleStartup,
  cleanupTargets,
  onExecuteCleanup,
  cleanupResult
}) => {
  const [selectedCleanupIds, setSelectedCleanupIds] = useState<string[]>([
    'user_temp',
    'crash_dumps'
  ]);

  const toggleCleanupSelection = (id: string) => {
    if (selectedCleanupIds.includes(id)) {
      setSelectedCleanupIds(selectedCleanupIds.filter(item => item !== id));
    } else {
      setSelectedCleanupIds([...selectedCleanupIds, id]);
    }
  };

  const totalSelectedBytes = cleanupTargets
    .filter(t => selectedCleanupIds.includes(t.id))
    .reduce((sum, t) => sum + t.totalBytes, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Inicialização do Windows e Limpeza de Cache
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Gerenciamento reversível de inicialização e recuperação segura de espaço em disco. Documentos pessoais e arquivos críticos nunca são tocados.
        </p>
      </div>

      {/* 1. Gerenciador de Inicialização Reversível (Seção 17) */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2F2F2F] mb-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="text-[#00E5FF]" size={16} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Aplicativos de Inicialização Automática
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Chaves de Registro HKCU e HKLM Run
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#2E2E2E] text-neutral-500 font-mono">
                <th className="py-2.5 px-3">Aplicativo</th>
                <th className="py-2.5 px-3">Chave no Registro</th>
                <th className="py-2.5 px-3">Classificação de Risco</th>
                <th className="py-2.5 px-3">Recomendação Técnica</th>
                <th className="py-2.5 px-3 text-right">Status / Alternar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {startupEntries.map((entry) => (
                <tr key={entry.name} className="hover:bg-[#2A2A2A]/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{entry.name}</div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate max-w-xs">
                      {entry.command}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-400">
                    {entry.source}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                        entry.risk === 'BAIXO'
                          ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30'
                          : entry.risk === 'MÉDIO'
                          ? 'bg-[#FFB300]/10 text-[#FFB300] border border-[#FFB300]/30'
                          : 'bg-red-900/30 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {entry.risk}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-300">
                    {entry.recommendation}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onToggleStartup(entry.name, !entry.isEnabled)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                        entry.isEnabled
                          ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40 hover:bg-[#00E5FF]/20'
                          : 'bg-[#1C1C1C] text-neutral-400 border border-[#333333] hover:text-white'
                      }`}
                    >
                      {entry.isEnabled ? 'ATIVADO' : 'DESATIVADO'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Limpeza Direcionada de Arquivos Temporários (Seção 18) */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#2F2F2F] gap-2">
          <div className="flex items-center gap-2">
            <Trash2 className="text-[#00E5FF]" size={16} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Limpeza Direcionada de Arquivos Temporários
            </h2>
          </div>
          <div className="text-xs font-mono text-neutral-400">
            Selecionado: <span className="text-[#00E5FF] font-semibold">{(totalSelectedBytes / (1024 * 1024)).toFixed(1)} MB</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D] text-xs text-neutral-400 leading-relaxed">
          <strong className="text-neutral-300">Diretriz da Seção 18: </strong>
          O OptiWinX nunca promete ganhos de FPS ao limpar cache. A finalidade desta ação é recuperar espaço em disco e eliminar logs corrompidos ou obsoletos.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cleanupTargets.map((target) => {
            const isSelected = selectedCleanupIds.includes(target.id);
            return (
              <div
                key={target.id}
                onClick={() => toggleCleanupSelection(target.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isSelected
                    ? 'bg-[#292929] border-[#00E5FF]/50 shadow-xs'
                    : 'bg-[#1B1B1B] border-[#2D2D2D] hover:border-[#3D3D3D]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="mt-1 accent-[#00E5FF]"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{target.name}</span>
                    <span className="font-mono text-[#00E5FF]">
                      {(target.totalBytes / (1024 * 1024)).toFixed(0)} MB
                    </span>
                  </div>
                  <p className="text-neutral-400 mt-1">{target.description}</p>
                  <div className="text-[10px] font-mono text-neutral-500 mt-1.5">
                    {target.fileCount} arquivos · {target.path}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cleanupResult && (
          <div className="p-3 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 text-xs text-[#00E676] flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{cleanupResult.summary}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onExecuteCleanup(selectedCleanupIds)}
            disabled={selectedCleanupIds.length === 0}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#00E5FF] text-black hover:bg-[#38EAFF] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Executar Limpeza Segura
          </button>
        </div>
      </div>
    </div>
  );
};
