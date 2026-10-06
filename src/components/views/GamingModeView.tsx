/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Visualização: GamingModeView.tsx (Português do Brasil)
 */

import React from 'react';
import { 
  SafetyPolicy, 
  TransactionEntry, 
  ProposedAction 
} from '../../types/optiwin';
import { 
  Gamepad2, 
  ShieldCheck, 
  Eye 
} from 'lucide-react';

interface GamingModeViewProps {
  isGamingModeActive: boolean;
  onToggleGamingMode: () => void;
  policy: SafetyPolicy;
  setPolicy: (p: SafetyPolicy) => void;
  transactions: TransactionEntry[];
  proposedActions: ProposedAction[];
  onRollbackTransaction: (txId: string) => void;
  onRollbackAll: () => void;
  activeGameName: string;
}

export const GamingModeView: React.FC<GamingModeViewProps> = ({
  isGamingModeActive,
  onToggleGamingMode,
  policy,
  setPolicy,
  transactions,
  proposedActions,
  onRollbackTransaction,
  onRollbackAll,
  activeGameName
}) => {
  const activeTransactions = transactions.filter(
    t => t.status === 'Aplicado' || t.status === 'Verificado' || t.status === 'Pendente'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cartão de Controle do Modo Jogo */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#2E2E2E] gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#00E5FF]">
                Controlador Transacional Seguro
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-xs text-neutral-400">
                Recuperação contra Falhas: Diário Ativo
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
              Modo Jogo e Diário de Transações
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleGamingMode}
              className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                isGamingModeActive
                  ? 'bg-[#FF5252] text-white hover:bg-[#FF3333]'
                  : 'bg-[#00E5FF] text-black hover:bg-[#38EAFF] shadow-lg shadow-[#00E5FF]/20'
              }`}
            >
              <Gamepad2 size={16} />
              <span>{isGamingModeActive ? 'DESATIVAR E REVERTER TUDO' : 'ATIVAR MODO JOGO'}</span>
            </button>
          </div>
        </div>

        {/* Políticas de Segurança e Jogo em Foco */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D]">
            <span className="text-neutral-500 block mb-1">Jogo Identificado em Foco</span>
            <div className="font-semibold text-white font-mono text-sm">
              {activeGameName || 'Nenhum jogo em execução'}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Elevado para ACIMA DO NORMAL. Nunca configurado em TEMPO REAL.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D]">
            <span className="text-neutral-500 block mb-2">Política de Segurança (Seção 16)</span>
            <div className="flex items-center gap-1.5">
              {(['SEGURO', 'EQUILIBRADO', 'PERSONALIZADO'] as SafetyPolicy[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPolicy(p)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    policy === p
                      ? 'bg-[#00E5FF] text-black font-semibold'
                      : 'bg-[#252525] text-neutral-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              {policy === 'SEGURO' && 'Apenas modulação EcoQoS. Prioridades de processo permanecem intactas.'}
              {policy === 'EQUILIBRADO' && 'Prioridade ABAIXO DO NORMAL + EcoQoS para apps em segundo plano.'}
              {policy === 'PERSONALIZADO' && 'Permite seleção manual de processos a otimizar.'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D]">
            <span className="text-neutral-500 block mb-1">Status do Diário de Transações</span>
            <div className="font-semibold text-white font-mono text-sm flex items-center justify-between">
              <span>{activeTransactions.length} Registros Ativos</span>
              {activeTransactions.length > 0 && (
                <button
                  onClick={onRollbackAll}
                  className="text-xs text-[#FFB300] hover:underline cursor-pointer"
                >
                  Reverter Todos &rarr;
                </button>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Sincronizado no arquivo optiwin_recovery.journal.
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Transações Ativas */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2F2F2F] mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#00E5FF]" size={16} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Diário de Transações Ativas (Mudanças Verificadas)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Total no Diário: {transactions.length} registros
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            Nenhuma modificação ativa no momento. O sistema está operando nas configurações padrão do Windows.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#2E2E2E] text-neutral-500 font-mono">
                  <th className="py-2.5 px-3">ID da Transação</th>
                  <th className="py-2.5 px-3">PID</th>
                  <th className="py-2.5 px-3">Processo</th>
                  <th className="py-2.5 px-3">Prioridade Inicial</th>
                  <th className="py-2.5 px-3">Prioridade Nova</th>
                  <th className="py-2.5 px-3">EcoQoS</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-[#2A2A2A]/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-neutral-400">
                      {tx.transactionId}
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-400 tabular-nums">
                      {tx.pid}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {tx.processName}
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-400">
                      {tx.originalPriority}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#00E5FF] font-semibold">
                      {tx.modifiedPriority}
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-300">
                      {tx.originalEcoQoS ? 'ATIVO' : 'DESAT'} &rarr; {tx.modifiedEcoQoS ? 'ATIVO' : 'DESAT'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          tx.status === 'Verificado' || tx.status === 'Aplicado'
                            ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
                            : tx.status === 'Revertido'
                            ? 'bg-neutral-800 text-neutral-400'
                            : 'bg-red-900/30 text-red-400 border border-red-800/40'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {tx.status !== 'Revertido' && (
                        <button
                          onClick={() => onRollbackTransaction(tx.transactionId)}
                          className="px-2 py-1 text-[11px] font-medium rounded bg-[#2E2E2E] hover:bg-[#383838] text-[#FFB300] border border-[#444444] transition-colors cursor-pointer"
                        >
                          Restaurar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ações Propostas (Prévia da Simulação) */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2F2F2F] mb-4">
          <div className="flex items-center gap-2">
            <Eye className="text-[#00E5FF]" size={16} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Auditoria de Otimizações Propostas (Prévia da Simulação)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#00E676]">
            Zero modificações até o comando de ativação
          </span>
        </div>

        <div className="space-y-3">
          {proposedActions.map((act) => (
            <div
              key={act.pid}
              className="p-3.5 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{act.processName}</span>
                  <span className="text-neutral-500 font-mono">(PID {act.pid})</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#262626] text-neutral-400 font-mono">
                    {act.category}
                  </span>
                </div>
                <p className="text-neutral-400">
                  {act.reason}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
                <div className="text-neutral-400">
                  Prioridade: <span className="text-neutral-300">{act.currentPriority}</span> &rarr; <span className="text-[#00E5FF] font-semibold">{act.proposedPriority}</span>
                </div>
                <div className="text-neutral-400">
                  EcoQoS: <span className="text-[#00E676]">{act.proposedEcoQoS ? 'ATIVAR' : 'DESATIVAR'}</span>
                </div>
                <span className="text-[10px] text-[#00E676] font-semibold px-1.5 py-0.5 rounded bg-[#00E676]/10 border border-[#00E676]/30">
                  Reversível: SIM
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
