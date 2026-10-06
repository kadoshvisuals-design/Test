/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Visualização: CppCodeView.tsx (Português do Brasil)
 */

import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';

interface CppCodeViewProps {
  onRunCliCommand: (cmd: string) => string;
}

export const CppCodeView: React.FC<CppCodeViewProps> = ({ onRunCliCommand }) => {
  const [copied, setCopied] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string>('--dry-run');
  const [terminalOutput, setTerminalOutput] = useState<string>(
    onRunCliCommand('--dry-run')
  );

  const fileManifest = [
    { name: 'OptiWinCore.hpp', category: 'Tipos e Interfaces Centrais' },
    { name: 'HardwareDetector.hpp', category: 'Mecanismo de Telemetria' },
    { name: 'HardwareDetector.cpp', category: 'CPUID / DXGI / Win32' },
    { name: 'MemoryManager.hpp', category: 'Pressão Adaptativa de RAM' },
    { name: 'MemoryManager.cpp', category: 'Cálculo e Redução Segura' },
    { name: 'ProcessEngine.hpp', category: 'Inteligência de Processos' },
    { name: 'ProcessEngine.cpp', category: 'Toolhelp32 e EcoQoS' },
    { name: 'BottleneckAnalyzer.hpp', category: 'Diagnóstico de Gargalos' },
    { name: 'BottleneckAnalyzer.cpp', category: 'Correlação e Confiança' },
    { name: 'GamingModeEngine.hpp', category: 'Modo Jogo Transacional' },
    { name: 'GamingModeEngine.cpp', category: 'Lógica de Reversão Automática' },
    { name: 'TransactionJournal.hpp', category: 'Diário contra Quedas' },
    { name: 'TransactionJournal.cpp', category: 'Persistência Atômica' },
    { name: 'PerformanceMonitor.hpp', category: 'Telemetria de Baixo Impacto' },
    { name: 'PerformanceMonitor.cpp', category: 'Médias Móveis e Histerese' },
    { name: 'MainApp.cpp', category: 'Despachante CLI e GUI' },
    { name: 'CMakeLists.txt', category: 'Sistema de Compilação C++20' },
    { name: 'build_x64.bat', category: 'Script de Compilação VS2022' },
    { name: 'SAFETY.md', category: 'Constituição de Segurança' },
    { name: 'README.md', category: 'Documentação Técnica' }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(terminalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteCli = (cmd: string) => {
    setActiveCommand(cmd);
    const result = onRunCliCommand(cmd);
    setTerminalOutput(result);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Arquitetura Nativa em C++20 e Terminal CLI
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Código-fonte em conformidade rigorosa com C++20, MSVC e APIs nativas Win32/DXGI do Windows 10 e 11 x64.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#00E5FF] px-2.5 py-1 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30">
            Nativo Windows 10/11 x64
          </span>
          <a
            href="/OptiWinX-v2.0-Windows-x64.zip"
            download="OptiWinX-v2.0-Windows-x64.zip"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-[#00E5FF] text-black hover:bg-[#38EAFF] transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Baixar Pacote (.ZIP)</span>
          </a>
        </div>
      </div>

      {/* Terminal Interativo da CLI (Seção 20) */}
      <div className="bg-[#181818] border border-[#333333] rounded-xl overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-[#1F1F1F] border-b border-[#2C2C2C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-[#00E5FF]" />
            <span className="text-xs font-mono font-semibold text-white">
              Terminal de Comandos OptiWinX.exe (Seção 20)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-[#2A2A2A] rounded border border-[#3A3A3A] cursor-pointer"
            >
              {copied ? <Check size={12} className="text-[#00E676]" /> : <Copy size={12} />}
              <span>{copied ? 'Copiado!' : 'Copiar Saída'}</span>
            </button>
          </div>
        </div>

        {/* Botões de Comando Rápido */}
        <div className="px-4 py-2.5 bg-[#141414] border-b border-[#252525] flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-neutral-500 mr-1 text-[11px]">Comando:</span>
          {[
            '--dry-run',
            '--analyze',
            '--gaming',
            '--rollback',
            '--diagnostics',
            '--cleanup',
            '--version'
          ].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleExecuteCli(cmd)}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                activeCommand === cmd
                  ? 'bg-[#00E5FF] text-black font-semibold'
                  : 'bg-[#222222] text-neutral-300 hover:bg-[#2C2C2C]'
              }`}
            >
              OptiWinX {cmd}
            </button>
          ))}
        </div>

        {/* Tela do Terminal */}
        <div className="p-4 bg-[#121212] font-mono text-xs text-neutral-200 overflow-x-auto max-h-96 leading-relaxed select-text">
          <div className="text-neutral-500 mb-2">
            C:\Windows\System32&gt; OptiWinX.exe {activeCommand}
          </div>
          <pre className="text-neutral-200 whitespace-pre-wrap">{terminalOutput}</pre>
        </div>
      </div>

      {/* Manifesto dos Arquivos Modulares C++20 (Seção 29) */}
      <div className="bg-[#242424] border border-[#333333] rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2F2F2F] mb-4">
          <div className="flex items-center gap-2">
            <FileCode className="text-[#00E5FF]" size={16} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Módulos Nativos em C++20 (Seção 29)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            20 Arquivos de Código-Fonte Implementados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {fileManifest.map((f) => (
            <div
              key={f.name}
              className="p-3 rounded-lg bg-[#1B1B1B] border border-[#2D2D2D] hover:border-[#00E5FF]/40 transition-colors"
            >
              <div className="font-mono font-semibold text-white truncate" title={f.name}>
                {f.name}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">
                {f.category}
              </div>
              <div className="mt-2 text-[10px] font-mono text-[#00E676] flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Implementação Completa</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
