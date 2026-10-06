/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Componente Principal da Aplicação em Português do Brasil (pt-BR)
 */

import React, { useState, useEffect } from 'react';
import { 
  HardwareProfile, 
  SystemMetrics, 
  BottleneckDiagnosis, 
  ProcessInfo, 
  TransactionEntry, 
  StartupEntry, 
  CleanupTarget, 
  CleanupResult, 
  LogEntry, 
  ElevationState, 
  SafetyPolicy 
} from './types/optiwin';
import { 
  defaultHardwareProfile, 
  initialProcesses, 
  initialStartupEntries, 
  initialCleanupTargets, 
  calculateMemoryPressure, 
  analyzeBottleneck, 
  planDryRunOptimizations, 
  getNowTimestamp 
} from './services/optiwinEngine';

import { Header } from './components/layout/Header';
import { Sidebar, NavTabId } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { MonitorView } from './components/views/MonitorView';
import { ProcessView } from './components/views/ProcessView';
import { BottleneckView } from './components/views/BottleneckView';
import { GamingModeView } from './components/views/GamingModeView';
import { StartupCleanupView } from './components/views/StartupCleanupView';
import { CppCodeView } from './components/views/CppCodeView';
import { DownloadView } from './components/views/DownloadView';
import { LogsView } from './components/views/LogsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [elevation, setElevation] = useState<ElevationState>('ADMINISTRADOR');
  const [isGamingModeActive, setIsGamingModeActive] = useState<boolean>(false);
  const [policy, setPolicy] = useState<SafetyPolicy>('SEGURO');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Estados de Hardware e Telemetria
  const [hardware, setHardware] = useState<HardwareProfile>(defaultHardwareProfile);
  const [metrics, setMetrics] = useState<SystemMetrics>(() => {
    const memCalc = calculateMemoryPressure(52, 48, 1.8);
    return {
      cpuUsagePercent: 38.5,
      perCoreUsage: [42, 35, 58, 30, 44, 28, 51, 33, 40, 31, 45, 29, 39, 36, 48, 32],
      ramUsagePercent: 52,
      commitUsagePercent: 48,
      availableRamMb: 15760,
      gpuUsagePercent: 92.4,
      vramUsedMb: 7650,
      vramTotalMb: 12288,
      hardPageFaultsPerSec: 1.8,
      memoryPressureScore: memCalc.score,
      pressureState: memCalc.state,
      timestamp: getNowTimestamp()
    };
  });

  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([metrics]);
  const [diagnosis, setDiagnosis] = useState<BottleneckDiagnosis>(() => analyzeBottleneck(metrics));
  const [processes, setProcesses] = useState<ProcessInfo[]>(initialProcesses);
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [startupEntries, setStartupEntries] = useState<StartupEntry[]>(initialStartupEntries);
  const [cleanupTargets, setCleanupTargets] = useState<CleanupTarget[]>(initialCleanupTargets);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [cooldownPids, setCooldownPids] = useState<Set<number>>(new Set());

  // Diário e Registro de Eventos de Auditoria
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-init-1',
      timestamp: getNowTimestamp(),
      action: 'Inicialização do Motor',
      processName: 'OptiWinX.exe',
      pid: 6140,
      previousState: 'Não Carregado',
      newState: 'Ativo',
      reason: 'Aplicativo iniciado com privilégios de Administrador. Mecanismos Win32, CPUID e DXGI prontos.',
      risk: 'BAIXO',
      verification: 'SUCESSO',
      rollbackResult: 'N/A'
    },
    {
      id: 'log-init-2',
      timestamp: getNowTimestamp(),
      action: 'Verificação do Diário',
      processName: 'JournalEngine',
      pid: 0,
      previousState: 'Varrendo',
      newState: 'Sincronizado',
      reason: 'Arquivo optiwin_recovery.journal verificado. Nenhuma transação pendente; estado inicial íntegro.',
      risk: 'BAIXO',
      verification: 'VERIFICADO',
      rollbackResult: 'DISPONÍVEL'
    }
  ]);

  // Atualização periódica da telemetria (simulação de histerese em tempo real)
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((prev) => {
        const cpuDrift = (Math.random() - 0.5) * 4.0;
        const newCpu = Math.min(99, Math.max(12, prev.cpuUsagePercent + cpuDrift));

        const gpuDrift = (Math.random() - 0.5) * 3.0;
        const newGpu = Math.min(99, Math.max(20, prev.gpuUsagePercent + gpuDrift));

        const ramDrift = (Math.random() - 0.5) * 0.8;
        const newRam = Math.min(95, Math.max(30, prev.ramUsagePercent + ramDrift));

        const memCalc = calculateMemoryPressure(newRam, prev.commitUsagePercent, prev.hardPageFaultsPerSec);

        const updated: SystemMetrics = {
          ...prev,
          cpuUsagePercent: Number(newCpu.toFixed(1)),
          gpuUsagePercent: Number(newGpu.toFixed(1)),
          ramUsagePercent: Number(newRam.toFixed(1)),
          memoryPressureScore: memCalc.score,
          pressureState: memCalc.state,
          timestamp: getNowTimestamp()
        };

        setDiagnosis(analyzeBottleneck(updated));
        setMetricsHistory((h) => {
          const nextH = [...h, updated];
          return nextH.length > 20 ? nextH.slice(nextH.length - 20) : nextH;
        });

        return updated;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const addLog = (
    action: string,
    processName: string,
    pid: number,
    previousState: string,
    newState: string,
    reason: string,
    risk: 'BAIXO' | 'MÉDIO' | 'ALTO' = 'BAIXO',
    verification: string = 'SUCESSO',
    rollbackResult: string = 'DISPONÍVEL'
  ) => {
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: getNowTimestamp(),
      action,
      processName,
      pid,
      previousState,
      newState,
      reason,
      risk,
      verification,
      rollbackResult
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  // Ação: Analisar Sistema
  const handleRunAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const diag = analyzeBottleneck(metrics);
      setDiagnosis(diag);
      addLog(
        'Diagnóstico do Sistema',
        'OptiWinX.exe',
        6140,
        'Ocioso',
        'Analisado',
        `Diagnóstico de hardware e memória concluído com êxito. Estado: ${diag.type} (${diag.confidencePercent}% de confiança).`,
        'BAIXO',
        'VERIFICADO'
      );
    }, 600);
  };

  // Ação: Simulação (Dry-Run: ZERO modificações no sistema)
  const handleRunDryRun = () => {
    const proposed = planDryRunOptimizations(processes, policy);
    addLog(
      'Simulação de Otimização',
      'GamingModeEngine',
      0,
      'Pré-Auditoria',
      'Simulado (0 Modificações)',
      `Avaliadas ${proposed.length} otimizações potenciais na política ${policy}. Nenhuma alteração foi gravada no sistema.`,
      'BAIXO',
      'SIMULADO_SEGURO',
      'SIM'
    );
    setCurrentTab('gaming');
  };

  // Ação: Ativar / Desativar Modo Jogo (Seções 12, 14, 15)
  const handleToggleGamingMode = () => {
    if (isGamingModeActive) {
      handleRollbackAll();
      setIsGamingModeActive(false);
      addLog(
        'Modo Jogo Desativado',
        'GamingModeEngine',
        0,
        'Ativo',
        'Em Espera',
        'Modo Jogo desativado com sucesso. Todas as prioridades e restrições EcoQoS retornaram aos valores padrão.',
        'BAIXO',
        'RESTAURADO_VERIFICADO'
      );
    } else {
      const proposed = planDryRunOptimizations(processes, policy);
      const newTransactions: TransactionEntry[] = [];

      setProcesses((prevProcs) =>
        prevProcs.map((p) => {
          const act = proposed.find((a) => a.pid === p.pid);
          if (act) {
            const tx: TransactionEntry = {
              transactionId: `TX-${p.pid}-${Date.now() % 100000}`,
              pid: p.pid,
              processName: p.name,
              originalPriority: p.priorityName,
              modifiedPriority: act.proposedPriority as any,
              originalEcoQoS: p.ecoQoSEnabled,
              modifiedEcoQoS: act.proposedEcoQoS,
              reason: act.reason,
              risk: act.risk,
              status: 'Verificado',
              timestamp: getNowTimestamp(),
              verificationResult: 'Confirmado via GetPriorityClass e SetProcessInformation'
            };
            newTransactions.push(tx);

            addLog(
              'Alteração de Estado de Processo',
              p.name,
              p.pid,
              `${p.priorityName} (EcoQoS: ${p.ecoQoSEnabled ? 'ATIVO' : 'DESAT'})`,
              `${act.proposedPriority} (EcoQoS: ${act.proposedEcoQoS ? 'ATIVO' : 'DESAT'})`,
              act.reason,
              act.risk,
              'SUCESSO',
              'DISPONÍVEL'
            );

            return {
              ...p,
              priorityName: act.proposedPriority as any,
              ecoQoSEnabled: act.proposedEcoQoS
            };
          }
          return p;
        })
      );

      setTransactions((prev) => [...newTransactions, ...prev]);
      setIsGamingModeActive(true);
      addLog(
        'Modo Jogo Ativado',
        'GamingModeEngine',
        0,
        'Em Espera',
        'Ativo',
        `Ativado com ${newTransactions.length} regras registradas de forma atômica no diário de recuperação.`,
        'BAIXO',
        'APLICADO_VERIFICADO'
      );
    }
  };

  // Reverter uma transação específica
  const handleRollbackTransaction = (txId: string) => {
    const tx = transactions.find((t) => t.transactionId === txId);
    if (!tx) return;

    setProcesses((prev) =>
      prev.map((p) => {
        if (p.pid === tx.pid) {
          return {
            ...p,
            priorityName: tx.originalPriority as any,
            ecoQoSEnabled: tx.originalEcoQoS
          };
        }
        return p;
      })
    );

    setTransactions((prev) =>
      prev.map((t) => (t.transactionId === txId ? { ...t, status: 'Revertido' } : t))
    );

    addLog(
      'Reversão de Transação',
      tx.processName,
      tx.pid,
      tx.modifiedPriority,
      tx.originalPriority,
      `Restaurada a prioridade original (${tx.originalPriority}) e estado do EcoQoS. Diário atualizado.`,
      'BAIXO',
      'RESTAURADO',
      'CONCLUÍDO'
    );
  };

  // Reversão em lote
  const handleRollbackAll = () => {
    const active = transactions.filter(
      (t) => t.status === 'Aplicado' || t.status === 'Verificado' || t.status === 'Pendente'
    );

    if (active.length === 0) return;

    setProcesses((prev) =>
      prev.map((p) => {
        const tx = active.find((t) => t.pid === p.pid);
        if (tx) {
          return {
            ...p,
            priorityName: tx.originalPriority as any,
            ecoQoSEnabled: tx.originalEcoQoS
          };
        }
        return p;
      })
    );

    setTransactions((prev) =>
      prev.map((t) =>
        t.status === 'Aplicado' || t.status === 'Verificado' || t.status === 'Pendente'
          ? { ...t, status: 'Revertido' }
          : t
      )
    );

    setIsGamingModeActive(false);

    addLog(
      'Reversão Geral Concluída',
      'TransactionJournal',
      0,
      `${active.length} Regras Ativas`,
      'Restaurado',
      'Todos os processos foram retornados aos estados de prioridade e energia originais.',
      'BAIXO',
      'VERIFICADO_SEGURO',
      'CONCLUÍDO'
    );
  };

  // Ajuste manual de prioridade com proteção estrita
  const handleSetPriority = (pid: number, newPriority: string) => {
    if (newPriority === 'TEMPO REAL') {
      alert('Invariante de Segurança: A prioridade TEMPO REAL é estritamente proibida pelo OptiWinX para evitar travamento do teclado, mouse e interrupções do kernel.');
      return;
    }

    setProcesses((prev) =>
      prev.map((p) => {
        if (p.pid === pid) {
          addLog(
            'Ajuste Manual de Prioridade',
            p.name,
            p.pid,
            p.priorityName,
            newPriority,
            'Definição manual de classe de prioridade pelo operador.',
            'BAIXO',
            'VERIFICADO'
          );
          return { ...p, priorityName: newPriority as any };
        }
        return p;
      })
    );
  };

  // Alternar EcoQoS
  const handleToggleEcoQoS = (pid: number, current: boolean) => {
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.pid === pid) {
          const nextState = !current;
          addLog(
            'Ajuste de Energia EcoQoS',
            p.name,
            p.pid,
            current ? 'ATIVO' : 'DESAT',
            nextState ? 'ATIVO' : 'DESAT',
            'Alternância da flag ProcessPowerThrottling do Windows 11.',
            'BAIXO',
            'VERIFICADO'
          );
          return { ...p, ecoQoSEnabled: nextState };
        }
        return p;
      })
    );
  };

  // Redução de Memória (Working-Set Trim)
  const handleTrimProcess = (pid: number) => {
    const target = processes.find((p) => p.pid === pid);
    if (!target) return;

    if (target.isProtected || target.isExcluded) {
      alert(`Violação de Segurança: O processo ${target.name} é protegido pelo sistema e não pode ser reduzido.`);
      return;
    }

    if (cooldownPids.has(pid)) {
      alert(`Intervalo de Segurança Ativo: O processo ${target.name} (PID ${pid}) foi reduzido recentemente. O intervalo mínimo é de 5 minutos.`);
      return;
    }

    const bytesBefore = target.workingSetBytes;
    const recoveredBytes = Math.round(bytesBefore * 0.45);
    const bytesAfter = bytesBefore - recoveredBytes;

    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid ? { ...p, workingSetBytes: bytesAfter } : p))
    );

    setCooldownPids((prev) => new Set(prev).add(pid));

    addLog(
      'Redução Segura de Memória',
      target.name,
      target.pid,
      `${(bytesBefore / (1024 * 1024)).toFixed(0)} MB`,
      `${(bytesAfter / (1024 * 1024)).toFixed(0)} MB`,
      `Chamada EmptyWorkingSet validada: ${(recoveredBytes / (1024 * 1024)).toFixed(1)} MB transferidos para cache sem afetar a estabilidade.`,
      'BAIXO',
      'SUCESSO_VERIFICADO'
    );
  };

  // Alternar Inicialização
  const handleToggleStartup = (name: string, enable: boolean) => {
    setStartupEntries((prev) =>
      prev.map((e) => (e.name === name ? { ...e, isEnabled: enable } : e))
    );
    addLog(
      'Inicialização Automática',
      name,
      0,
      enable ? 'DESATIVADO' : 'ATIVADO',
      enable ? 'ATIVADO' : 'DESATIVADO',
      'Entrada da chave Run do Registro modificada de forma reversível.',
      'BAIXO',
      'REGISTRO_ATUALIZADO'
    );
  };

  // Executar Limpeza de Cache
  const handleExecuteCleanup = (selectedIds: string[]) => {
    let freedBytes = 0;
    let filesCount = 0;

    const updatedTargets = cleanupTargets.map((t) => {
      if (selectedIds.includes(t.id)) {
        freedBytes += t.totalBytes;
        filesCount += t.fileCount;
        return { ...t, totalBytes: 0, fileCount: 0 };
      }
      return t;
    });

    setCleanupTargets(updatedTargets);
    const mbFreed = (freedBytes / (1024 * 1024)).toFixed(1);
    const result: CleanupResult = {
      success: true,
      bytesFreed: freedBytes,
      filesDeleted: filesCount,
      errorsEncountered: 0,
      summary: `Limpeza finalizada com êxito: ${mbFreed} MB recuperados em ${filesCount} arquivos residuais.`
    };
    setCleanupResult(result);

    addLog(
      'Limpeza de Cache Residual',
      'CleanupManager',
      0,
      'Arquivos Temporários',
      'Limpos',
      `Recuperados ${mbFreed} MB de espaço em disco sem afetar nenhum dado pessoal.`,
      'BAIXO',
      'ESPAÇO_LIBERADO'
    );
  };

  // Simular Carga para Análise de Gargalos
  const handleSimulateWorkload = (type: 'gpu' | 'cpu' | 'ram' | 'balanced') => {
    setMetrics((prev) => {
      let updated = { ...prev };
      if (type === 'gpu') {
        updated.cpuUsagePercent = 32.0;
        updated.gpuUsagePercent = 98.0;
        updated.vramUsedMb = 9200;
      } else if (type === 'cpu') {
        updated.cpuUsagePercent = 96.0;
        updated.gpuUsagePercent = 38.0;
      } else if (type === 'ram') {
        updated.ramUsagePercent = 92.0;
        updated.commitUsagePercent = 89.0;
        const calc = calculateMemoryPressure(92, 89, 5.2);
        updated.memoryPressureScore = calc.score;
        updated.pressureState = calc.state;
      } else {
        updated.cpuUsagePercent = 25.0;
        updated.gpuUsagePercent = 20.0;
        updated.ramUsagePercent = 45.0;
        const calc = calculateMemoryPressure(45, 40, 0.5);
        updated.memoryPressureScore = calc.score;
        updated.pressureState = calc.state;
      }
      setDiagnosis(analyzeBottleneck(updated));
      return updated;
    });
  };

  // Executor interativo de comandos CLI da ferramenta
  const handleRunCliCommand = (cmd: string): string => {
    if (cmd === '--version' || cmd === '-v') {
      return `OptiWinX v2.0.0 [Nativo x64 (Windows 10/11)]\nModelo Arquitetural: MEDIR -> ANALISAR -> IDENTIFICAR GARGALO -> AÇÃO MÍNIMA -> VERIFICAR -> REVERTER\nTotalmente compatível com C++20 e compiladores MSVC / MinGW-w64.`;
    }

    if (cmd === '--analyze') {
      return `=== Perfil de Hardware OptiWinX ===\nSistema: ${hardware.os.osName} (${hardware.os.displayVersion})\nPrivilégio: ${elevation}\nProcessador: ${hardware.cpu.name} (${hardware.cpu.physicalCores} Núcleos Físicos, ${hardware.cpu.logicalProcessors} Threads)\nRAM: ${(metrics.ramUsagePercent).toFixed(0)}% em Uso | Disponível: ${(metrics.availableRamMb / 1024).toFixed(1)} GB\nPlaca de Vídeo: ${hardware.gpus[0]?.name}\n\n--- Telemetria em Tempo Real ---\nUso de CPU: ${metrics.cpuUsagePercent.toFixed(1)}%\nUso de GPU: ${metrics.gpuUsagePercent.toFixed(1)}% (VRAM: ${metrics.vramUsedMb} / ${metrics.vramTotalMb} MB)\nÍndice de Pressão de Memória: ${metrics.memoryPressureScore}/100 [${metrics.pressureState}]\n\n--- Diagnóstico do Gargalo ---\nDIAGNÓSTICO: ${diagnosis.type} (Grau de Confiança: ${diagnosis.confidencePercent}%)\nEVIDÊNCIA: ${diagnosis.supportingReason}`;
    }

    if (cmd === '--dry-run') {
      const actions = planDryRunOptimizations(processes, policy);
      let out = `=================================================================\n            AUDITORIA DE SIMULAÇÃO OPTIWINX (DRY-RUN)            \n=================================================================\nAVISO: A SIMULAÇÃO NÃO APLICA NENHUMA ALTERAÇÃO NO SISTEMA.\n\nEstado do Sistema: ${diagnosis.type} (Grau de Confiança: ${diagnosis.confidencePercent}%)\nPressão de Memória: ${metrics.memoryPressureScore}/100 [${metrics.pressureState}]\n\nOtimizações Propostas (${actions.length} ações recomendadas):\n`;
      actions.forEach((a, i) => {
        out += `-----------------------------------------------------------------\nAÇÃO PROPOSTA ${i + 1}: ${a.processName} (PID ${a.pid})\nClassificação: ${a.category}\nAlteração de Prioridade: ${a.currentPriority} -> ${a.proposedPriority}\nAlteração de EcoQoS: ${a.currentEcoQoS ? 'ATIVO' : 'DESAT'} -> ${a.proposedEcoQoS ? 'ATIVO' : 'DESAT'}\nMotivo: ${a.reason}\nRisco: ${a.risk} | Reversão Garantida: SIM\n`;
      });
      out += `-----------------------------------------------------------------\n\nSimulação finalizada. Total de modificações aplicadas: 0.\n`;
      return out;
    }

    if (cmd === '--gaming') {
      return `[Ativação do Modo Jogo OptiWinX]\n  > Jogo ativo identificado: Cyberpunk2077.exe (PID 4120)\n  > Cyberpunk2077.exe elevado com segurança para ACIMA DO NORMAL\n  > Modulação EcoQoS do Windows 11 ativada em chrome.exe (PID 8244)\n  > Discord.exe (PID 9188) ajustado para ABAIXO DO NORMAL\n  > Todas as alterações foram validadas via GetPriorityClass e SetProcessInformation\n  > 3 registros salvos com sucesso em optiwin_recovery.journal\n\nModo Jogo ativo. Execute 'OptiWinX.exe --rollback' a qualquer momento para desfazer.`;
    }

    if (cmd === '--rollback') {
      return `[Mecanismo de Reversão OptiWinX]\nRestaurando todos os processos para as configurações originais gravadas...\n\n  * Processo 'Cyberpunk2077.exe' (PID 4120) restaurado para: NORMAL\n  * Processo 'chrome.exe' (PID 8244) restaurado para EcoQoS: DESATIVADO\n  * Processo 'Discord.exe' (PID 9188) restaurado para: NORMAL\n\nSequência de reversão finalizada com sucesso. Diário de transações limpo.`;
    }

    if (cmd === '--diagnostics') {
      return `=================================================================\n          DIAGNÓSTICO E TELEMETRIA DO SISTEMA OPTIWINX           \n=================================================================\nSistema Operacional: ${hardware.os.osName}\nProcessador: ${hardware.cpu.name}\nRAM Total: ${(hardware.ram.totalPhysicalBytes / (1024 ** 3)).toFixed(1)} GB (${metrics.ramUsagePercent.toFixed(1)}% em Uso)\nPressão de Memória: ${metrics.memoryPressureScore}/100 [${metrics.pressureState}]\nGargalo Identificado: ${diagnosis.type} (${diagnosis.confidencePercent}%)\nProcessos Monitorados: ${processes.length}\nEstado do Diário: Sincronizado (${transactions.length} registros computados)\nSobrecarga de CPU do App: 0,18%\nMemória de Trabalho: 18,2 MB\n=================================================================`;
    }

    if (cmd === '--cleanup') {
      return `[Mecanismo de Limpeza Segura OptiWinX]\nLocais Auditados Prontos para Limpeza:\n  - [user_temp] Arquivos Temporários (%TEMP%): 840,0 MB em 412 arquivos\n  - [crash_dumps] Relatórios de Falhas: 310,0 MB em 6 arquivos\n\nExecutando limpeza cuidadosa de arquivos temporários...\nLimpeza concluída: 1150,0 MB recuperados com sucesso em 418 arquivos.\n`;
    }

    return `Comando desconhecido: ${cmd}\nExecute 'OptiWinX.exe --help' para visualizar os parâmetros aceitos.`;
  };

  const hasActiveRollback = transactions.some(
    (t) => t.status === 'Aplicado' || t.status === 'Verificado' || t.status === 'Pendente'
  ) || isGamingModeActive;

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-neutral-200 flex flex-col font-sans selection:bg-[#00E5FF]/30 selection:text-white">
      {/* Barra de Navegação Superior */}
      <Header
        isGamingModeActive={isGamingModeActive}
        onToggleGamingMode={handleToggleGamingMode}
        onRunAnalyze={handleRunAnalyze}
        onRunDryRun={handleRunDryRun}
        onRunRollback={handleRollbackAll}
        hasActiveRollback={hasActiveRollback}
        elevation={elevation}
        onToggleElevation={() =>
          setElevation((prev) => (prev === 'ADMINISTRADOR' ? 'PADRÃO' : 'ADMINISTRADOR'))
        }
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isAnalyzing={isAnalyzing}
      />

      {/* Corpo Principal: Barra Lateral + Área de Conteúdo */}
      <div className="flex-1 flex overflow-hidden">
        {/* Barra Lateral Responsiva */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activeTransactionsCount={
            transactions.filter((t) => t.status === 'Aplicado' || t.status === 'Verificado').length
          }
          elevation={elevation}
        />

        {/* Visualização Ativa */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#1A1A1A]">
          {currentTab === 'dashboard' && (
            <DashboardView
              hardware={hardware}
              metrics={metrics}
              diagnosis={diagnosis}
              processes={processes}
              isGamingModeActive={isGamingModeActive}
              onToggleGamingMode={handleToggleGamingMode}
              onRunAnalyze={handleRunAnalyze}
              onRunDryRun={handleRunDryRun}
              onRunRollback={handleRollbackAll}
              hasActiveRollback={hasActiveRollback}
              onSwitchTab={setCurrentTab}
              onTrimProcess={handleTrimProcess}
            />
          )}

          {currentTab === 'download' && (
            <DownloadView onRunCliCommand={handleRunCliCommand} />
          )}

          {currentTab === 'monitor' && (
            <MonitorView
              metrics={metrics}
              metricsHistory={metricsHistory}
              hardware={hardware}
            />
          )}

          {currentTab === 'processes' && (
            <ProcessView
              processes={processes}
              onSetPriority={handleSetPriority}
              onToggleEcoQoS={handleToggleEcoQoS}
              onTrimProcess={handleTrimProcess}
              cooldownPids={cooldownPids}
            />
          )}

          {currentTab === 'bottlenecks' && (
            <BottleneckView
              diagnosis={diagnosis}
              metrics={metrics}
              onSimulateWorkload={handleSimulateWorkload}
            />
          )}

          {currentTab === 'gaming' && (
            <GamingModeView
              isGamingModeActive={isGamingModeActive}
              onToggleGamingMode={handleToggleGamingMode}
              policy={policy}
              setPolicy={setPolicy}
              transactions={transactions}
              proposedActions={planDryRunOptimizations(processes, policy)}
              onRollbackTransaction={handleRollbackTransaction}
              onRollbackAll={handleRollbackAll}
              activeGameName={
                processes.find((p) => p.category === 'Jogo Ativo')?.name || 'Cyberpunk2077.exe'
              }
            />
          )}

          {currentTab === 'startup-cleanup' && (
            <StartupCleanupView
              startupEntries={startupEntries}
              onToggleStartup={handleToggleStartup}
              cleanupTargets={cleanupTargets}
              onExecuteCleanup={handleExecuteCleanup}
              cleanupResult={cleanupResult}
            />
          )}

          {currentTab === 'cpp-engine' && (
            <CppCodeView onRunCliCommand={handleRunCliCommand} />
          )}

          {currentTab === 'logs' && (
            <LogsView logs={logs} onClearLogs={() => setLogs([])} />
          )}
        </main>
      </div>
    </div>
  );
}
