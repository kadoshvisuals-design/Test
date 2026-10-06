/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Visualização: ProcessView.tsx (Português do Brasil)
 */

import React, { useState } from 'react';
import { ProcessInfo } from '../../types/optiwin';
import { 
  Search, 
  ShieldCheck 
} from 'lucide-react';

interface ProcessViewProps {
  processes: ProcessInfo[];
  onSetPriority: (pid: number, newPriority: string) => void;
  onToggleEcoQoS: (pid: number, current: boolean) => void;
  onTrimProcess: (pid: number) => void;
  cooldownPids: Set<number>;
}

export const ProcessView: React.FC<ProcessViewProps> = ({
  processes,
  onSetPriority,
  onToggleEcoQoS,
  onTrimProcess,
  cooldownPids
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODOS');

  const categories = [
    'TODOS',
    'Jogo Ativo',
    'Aplicativo em Segundo Plano',
    'Inicializador de Jogos',
    'Sistema Crítico',
    'Núcleo do Windows',
    'Segurança',
    'Driver / Hardware'
  ];

  const filteredProcesses = processes.filter((proc) => {
    const matchesSearch = proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proc.pid.toString().includes(searchTerm);
    const matchesCategory = categoryFilter === 'TODOS' || proc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Barra de Filtros e Busca */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Inteligência e Governança de Processos
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Varredura de processos via Toolhelp32. Componentes essenciais do Windows e softwares antivírus são estritamente protegidos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Campo de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
              <input
                type="text"
                placeholder="Buscar por PID ou executável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-[#1A1A1A] border border-[#333333] rounded-lg text-white placeholder-neutral-500 focus:outline-hidden focus:border-[#00E5FF] w-64 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Filtro por Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-500 text-[11px] font-semibold uppercase tracking-wider mr-1">
            Filtrar:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs font-medium ${
                categoryFilter === cat
                  ? 'bg-[#00E5FF] text-black font-semibold'
                  : 'bg-[#1C1C1C] text-neutral-400 hover:text-white hover:bg-[#282828] border border-[#2E2E2E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela Completa de Processos */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#2E2E2E] text-neutral-500 font-mono">
                <th className="py-3 px-3">PID</th>
                <th className="py-3 px-3">Nome do Processo</th>
                <th className="py-3 px-3">Classificação</th>
                <th className="py-3 px-3 text-right">CPU %</th>
                <th className="py-3 px-3 text-right">Memória (Working Set)</th>
                <th className="py-3 px-3">Classe de Prioridade</th>
                <th className="py-3 px-3">EcoQoS</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-right">Ação Segura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828]">
              {filteredProcesses.map((proc) => {
                const isCooldown = cooldownPids.has(proc.pid);
                const isImmutable = proc.isProtected || proc.isExcluded;

                return (
                  <tr key={proc.pid} className="hover:bg-[#2A2A2A]/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-neutral-400 tabular-nums">
                      {proc.pid}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{proc.name}</div>
                      <div className="text-[10px] text-neutral-500 font-mono truncate max-w-xs" title={proc.path}>
                        {proc.path}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-neutral-300">
                      {proc.category}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right text-neutral-300">
                      {proc.cpuPercent.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right text-neutral-300">
                      {(proc.workingSetBytes / (1024 * 1024)).toFixed(0)} MB
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {isImmutable ? (
                        <span className="text-neutral-500 font-medium">
                          {proc.priorityName}
                        </span>
                      ) : (
                        <select
                          value={proc.priorityName}
                          onChange={(e) => onSetPriority(proc.pid, e.target.value)}
                          className="bg-[#1C1C1C] border border-[#3A3A3A] text-white rounded px-2 py-1 text-xs focus:outline-hidden focus:border-[#00E5FF] cursor-pointer"
                        >
                          <option value="OCIOSA">OCIOSA</option>
                          <option value="ABAIXO DO NORMAL">ABAIXO DO NORMAL</option>
                          <option value="NORMAL">NORMAL</option>
                          <option value="ACIMA DO NORMAL">ACIMA DO NORMAL</option>
                          <option value="ALTA">ALTA</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isImmutable ? (
                        <span className="text-neutral-600 font-mono text-[11px]">—</span>
                      ) : (
                        <button
                          onClick={() => onToggleEcoQoS(proc.pid, proc.ecoQoSEnabled)}
                          title="Alterna limitação de consumo de energia de processo do Windows 11"
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer border ${
                            proc.ecoQoSEnabled
                              ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30'
                              : 'bg-[#1C1C1C] text-neutral-400 border-[#333333] hover:text-white'
                          }`}
                        >
                          {proc.ecoQoSEnabled ? 'ATIVO' : 'DESATIVADO'}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isImmutable ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#FFB300] font-medium">
                          <ShieldCheck size={12} />
                          Protegido
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#00E676] font-medium">
                          Otimizável
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isImmutable ? (
                        <span className="text-neutral-600 text-[11px]">Imutável</span>
                      ) : (
                        <button
                          onClick={() => onTrimProcess(proc.pid)}
                          disabled={isCooldown}
                          title={isCooldown ? 'Intervalo de proteção ativo (cooldown)' : 'Reduz páginas de trabalho não essenciais'}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                            isCooldown
                              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                              : 'bg-[#2E2E2E] hover:bg-[#383838] text-white border border-[#444444]'
                          }`}
                        >
                          {isCooldown ? 'Aguarde' : 'Reduzir WS'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
