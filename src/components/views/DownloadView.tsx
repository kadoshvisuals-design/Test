/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Visualização: DownloadView.tsx (Português do Brasil)
 * 
 * Central Oficial de Download e Instruções do Executável Nativo .EXE para Windows 10 e 11 x64
 */

import React, { useState } from 'react';
import { 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  ExternalLink, 
  HardDrive, 
  FolderDown, 
  Package, 
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';

interface DownloadViewProps {
  onRunCliCommand?: (cmd: string) => string;
}

export const DownloadView: React.FC<DownloadViewProps> = ({ onRunCliCommand }) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeCliCommand, setActiveCliCommand] = useState<string>('--analyze');
  const [cliOutput, setCliOutput] = useState<string>(() => 
    onRunCliCommand ? onRunCliCommand('--analyze') : ''
  );

  const files = [
    {
      id: 'standalone-exe',
      name: 'OptiWinX.exe',
      title: 'Executável Portátil Standalone (Recomendado)',
      badge: 'Portátil x64',
      badgeColor: 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30',
      size: '1,4 MB',
      description: 'Executável nativo completo com todas as bibliotecas embutidas estaticamente. Não requer instalação, instalador ou permissões especiais para iniciar.',
      downloadUrl: '/OptiWinX.exe',
      sha256: '7386e0a4f339f5536e398a11d6c147229f9d97f33f90c3ecf6ff9b592f7c0baa',
      highlight: true,
      features: [
        'Sem dependências externas de DLLs ou instaladores',
        'Interface Gráfica Win32 Fluent Dark + Modo CLI completo',
        'Contém algoritmos de telemetria Win32, CPUID, DXGI e EcoQoS',
        'Diário atômico persistente contra falhas (optiwin_recovery.journal)'
      ]
    },
    {
      id: 'setup-exe',
      name: 'OptiWinX-Setup.exe',
      title: 'Instalador Automático para Windows',
      badge: 'Instalador',
      badgeColor: 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30',
      size: '929 KB',
      description: 'Assistente de instalação que configura o OptiWinX em %LocalAppData%\\Programs\\OptiWinX com scripts de inicialização e desinstalação.',
      downloadUrl: '/OptiWinX-Setup.exe',
      sha256: '480ddd00d1d3b5fe5ddc3cbf8dcfe6296bde1fff1cb1682ac59f6c364fb169bb',
      highlight: false,
      features: [
        'Instalação rápida em apenas 1 clique',
        'Cria estrutura de diretórios e atalhos locais',
        'Script uninstall.bat incluído para remoção limpa',
        'Executa o aplicativo imediatamente após a instalação'
      ]
    },
    {
      id: 'zip-bundle',
      name: 'OptiWinX-v2.0-Windows-x64.zip',
      title: 'Pacote Completo Portátil (.ZIP)',
      badge: 'Código + Binário',
      badgeColor: 'text-[#FFB300] bg-[#FFB300]/10 border-[#FFB300]/30',
      size: '1,6 MB',
      description: 'Arquivo compactado contendo os binários executáveis (.exe), os 20 arquivos de código-fonte C++20, scripts de compilação CMake e documentação.',
      downloadUrl: '/OptiWinX-v2.0-Windows-x64.zip',
      sha256: '53d7c079585c93e05e1b70d9390380d9d559943aece1e19a61f80662418cd3c0',
      highlight: false,
      features: [
        'Inclui OptiWinX.exe e OptiWinX-Setup.exe',
        'Código-fonte completo em C++20 modular e limpo',
        'Scripts de compilação: CMakeLists.txt e build_x64.bat',
        'Documentação técnica detalhada e constituição de segurança'
      ]
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleTestCli = (cmd: string) => {
    setActiveCliCommand(cmd);
    if (onRunCliCommand) {
      setCliOutput(onRunCliCommand(cmd));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Banner Principal de Apresentação */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1A262C] via-[#1E1E1E] to-[#1E1E1E] border border-[#00E5FF]/30 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-semibold">
              <Sparkles size={13} />
              <span>APLICATIVO WINDOWS NATIVO .EXE FUNCIONAL E PRONTO</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              OptiWinX v2.0 para Windows 10 e Windows 11 (x64)
            </h1>

            <p className="text-sm text-neutral-300 leading-relaxed">
              O OptiWinX foi compilado nativamente em <strong>C++20</strong> com vinculação estática completa (zero dependências adicionais). Ele inclui interface gráfica nativa em modo escuro Fluent, suporte a linha de comando (CLI), detecção profunda de hardware, controle seguro de processos e reversão atômica com diário de integridade.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 bg-[#252525] px-2.5 py-1 rounded-md border border-[#333333]">
                <Cpu size={14} className="text-[#00E5FF]" />
                Arquitetura: x86-64 (64-bit)
              </span>
              <span className="flex items-center gap-1.5 bg-[#252525] px-2.5 py-1 rounded-md border border-[#333333]">
                <ShieldCheck size={14} className="text-[#00E676]" />
                Diário Atômico de Reversão
              </span>
              <span className="flex items-center gap-1.5 bg-[#252525] px-2.5 py-1 rounded-md border border-[#333333]">
                <Zap size={14} className="text-[#FFB300]" />
                Uso de CPU &lt; 0,2%
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              href="/OptiWinX.exe"
              download="OptiWinX.exe"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#00E5FF] text-black font-bold text-sm hover:bg-[#3AEAFF] transition-all shadow-lg shadow-[#00E5FF]/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Download size={18} />
              <span>Baixar OptiWinX.exe (1,4 MB)</span>
            </a>

            <a
              href="/OptiWinX-Setup.exe"
              download="OptiWinX-Setup.exe"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#282828] text-white font-semibold text-xs hover:bg-[#333333] border border-[#3D3D3D] transition-all cursor-pointer"
            >
              <Package size={15} className="text-[#00E676]" />
              <span>Baixar Instalador Setup (929 KB)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Cartões de Download das Opções Disponíveis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <div
            key={file.id}
            className={`bg-[#202020] rounded-xl border flex flex-col justify-between transition-all ${
              file.highlight 
                ? 'border-[#00E5FF]/50 shadow-lg shadow-[#00E5FF]/10 ring-1 ring-[#00E5FF]/20' 
                : 'border-[#2F2F2F] hover:border-[#404040]'
            }`}
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${file.badgeColor}`}>
                  {file.badge}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {file.size}
                </span>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  {file.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {file.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#2B2B2B]">
                <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block">
                  Destaques:
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {file.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-[#00E676] shrink-0 mt-0.5" />
                      <span className="leading-tight text-neutral-300">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0 space-y-3">
              <div className="p-2.5 rounded-lg bg-[#181818] border border-[#292929] text-[11px]">
                <div className="flex items-center justify-between text-neutral-400 mb-1">
                  <span className="font-mono">SHA-256:</span>
                  <button
                    onClick={() => handleCopy(file.sha256, file.id)}
                    className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    title="Copiar hash SHA-256"
                  >
                    {copiedHash === file.id ? (
                      <span className="text-[#00E676] flex items-center gap-1 font-semibold">
                        <Check size={11} /> Copiado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy size={11} /> Copiar
                      </span>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[10px] text-neutral-400 break-all select-all">
                  {file.sha256.substring(0, 32)}...
                </div>
              </div>

              <a
                href={file.downloadUrl}
                download={file.name}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  file.highlight
                    ? 'bg-[#00E5FF] text-black hover:bg-[#3AEAFF] shadow-md shadow-[#00E5FF]/20 font-bold'
                    : 'bg-[#2A2A2A] text-white hover:bg-[#353535] border border-[#3A3A3A]'
                }`}
              >
                <Download size={14} />
                <span>Baixar {file.name}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Guia de Instalação e Execução no Windows */}
      <div className="bg-[#222222] border border-[#333333] rounded-xl p-6 space-y-6">
        <div className="border-b border-[#2E2E2E] pb-4">
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <HardDrive size={18} className="text-[#00E5FF]" />
            Como Executar e Usar no Windows 10 e Windows 11
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Passo a passo descomplicado para utilizar o OptiWinX no seu computador com segurança absoluta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-xl bg-[#1B1B1B] border border-[#2B2B2B] space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] font-mono font-bold text-xs flex items-center justify-center border border-[#00E5FF]/30">
              1
            </div>
            <h3 className="text-sm font-semibold text-white">Baixe o Arquivo</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Clique em <strong>Baixar OptiWinX.exe</strong>. O arquivo tem apenas 1,4 MB e será salvo diretamente na sua pasta de Downloads.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1B1B1B] border border-[#2B2B2B] space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] font-mono font-bold text-xs flex items-center justify-center border border-[#00E5FF]/30">
              2
            </div>
            <h3 className="text-sm font-semibold text-white">Execute com 2 Cliques</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Dê dois cliques no <code>OptiWinX.exe</code>. Se o Windows SmartScreen exibir um alerta de arquivo baixado, clique em <strong>Mais informações</strong> e depois em <strong>Executar assim mesmo</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1B1B1B] border border-[#2B2B2B] space-y-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] font-mono font-bold text-xs flex items-center justify-center border border-[#00E5FF]/30">
              3
            </div>
            <h3 className="text-sm font-semibold text-white">Interface ou Terminal</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              A janela nativa Fluent Dark abrirá imediatamente. Você também pode abrir o Prompt de Comando (CMD) ou PowerShell na mesma pasta e executar parâmetros CLI.
            </p>
          </div>
        </div>

        {/* Parâmetros de Linha de Comando Disponíveis */}
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-[#00E5FF]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Parâmetros e Comandos de Linha de Comando (CLI)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">
              Prontos para automação ou atalhos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
            {[
              { cmd: 'OptiWinX.exe', desc: 'Inicia a Interface Gráfica Nativa Win32 (Fluent Dark)' },
              { cmd: 'OptiWinX.exe --analyze', desc: 'Analisa telemetria de CPU, GPU, RAM e gargalos' },
              { cmd: 'OptiWinX.exe --dry-run', desc: 'Simula otimizações propostas (0 modificações reais)' },
              { cmd: 'OptiWinX.exe --gaming', desc: 'Ativa o Modo Jogo com registro no diário' },
              { cmd: 'OptiWinX.exe --rollback', desc: 'Reverte imediatamente processos aos estados iniciais' },
              { cmd: 'OptiWinX.exe --diagnostics', desc: 'Gera relatório completo de diagnóstico do sistema' },
              { cmd: 'OptiWinX.exe --cleanup', desc: 'Audita e remove caches temporários com segurança' },
              { cmd: 'OptiWinX.exe --version', desc: 'Exibe versão do aplicativo e detalhes de compilação' },
              { cmd: 'OptiWinX.exe --help', desc: 'Exibe o manual de ajuda completo no terminal' }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg bg-[#141414] border border-[#282828] hover:border-[#00E5FF]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#00E5FF] font-bold">{item.cmd}</span>
                  <button
                    onClick={() => handleCopy(item.cmd, `cli-${idx}`)}
                    className="text-neutral-500 hover:text-white cursor-pointer"
                    title="Copiar comando"
                  >
                    {copiedHash === `cli-${idx}` ? <Check size={12} className="text-[#00E676]" /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="text-[11px] font-sans text-neutral-400 mt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Garantias de Segurança */}
        <div className="p-4 rounded-xl bg-[#172026] border border-[#00E5FF]/20 flex items-start gap-3">
          <ShieldCheck size={20} className="text-[#00E5FF] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-semibold text-white">Garantias Estritas de Segurança e Integridade</h4>
            <p className="text-neutral-300 leading-relaxed">
              O OptiWinX nunca aplica modificações destrutivas ao registro do Windows, não encerra processos do sistema (como <code>dwm.exe</code> ou <code>csrss.exe</code>) e nunca define prioridade de Tempo Real (Realtime Priority). Todas as alterações de afinidade e EcoQoS são atômicas e gravadas no arquivo local <code>optiwin_recovery.journal</code> com reversão verificada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
