/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Componente: Header.tsx (Português do Brasil)
 */

import React from 'react';
import { 
  ShieldCheck, 
  Gamepad2, 
  RotateCcw, 
  Search, 
  Menu, 
  X,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { ElevationState } from '../../types/optiwin';

interface HeaderProps {
  isGamingModeActive: boolean;
  onToggleGamingMode: () => void;
  onRunAnalyze: () => void;
  onRunDryRun: () => void;
  onRunRollback: () => void;
  hasActiveRollback: boolean;
  elevation: ElevationState;
  onToggleElevation: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isGamingModeActive,
  onToggleGamingMode,
  onRunAnalyze,
  onRunDryRun,
  onRunRollback,
  hasActiveRollback,
  elevation,
  onToggleElevation,
  mobileMenuOpen,
  setMobileMenuOpen,
  isAnalyzing
}) => {
  return (
    <header className="h-16 bg-[#1A1A1A] border-b border-[#2D2D2D] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Zona 1: Título e Marca */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-[#2D2D2D] transition-colors"
          aria-label="Alternar menu de navegação"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <Flame size={18} />
          </div>
          <span className="text-base font-semibold text-white tracking-tight whitespace-nowrap">
            OptiWinX <span className="text-xs font-mono text-[#00E5FF] px-1.5 py-0.5 rounded bg-[#00E5FF]/10 ml-1">v2.0</span>
          </span>
        </div>
      </div>

      {/* Zona 2: Indicadores de Estado do Sistema e Privilégios */}
      <div className="hidden md:flex items-center gap-4 text-xs font-medium text-neutral-400">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#242424] border border-[#333333]">
          <span className="text-neutral-500">Modo:</span>
          {isGamingModeActive ? (
            <span className="text-[#00E5FF] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
              JOGO ATIVO
            </span>
          ) : (
            <span className="text-neutral-300 font-medium">EM ESPERA</span>
          )}
        </div>

        <span aria-hidden="true" className="text-neutral-600">·</span>

        <div className="flex items-center gap-1.5 text-neutral-300">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
          <span>Saúde: <span className="text-[#00E676] font-semibold">EXCELENTE</span></span>
        </div>

        <span aria-hidden="true" className="text-neutral-600">·</span>

        <button
          onClick={onToggleElevation}
          title="Clique para alternar simulação de elevação UAC do Windows"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#242424] hover:bg-[#2E2E2E] border border-[#333333] transition-colors cursor-pointer"
        >
          <ShieldCheck size={13} className={elevation === 'ADMINISTRADOR' ? 'text-[#00E5FF]' : 'text-neutral-400'} />
          <span className="text-neutral-300">
            Privilégio: <span className={elevation === 'ADMINISTRADOR' ? 'text-[#00E5FF] font-semibold' : 'text-neutral-400'}>{elevation}</span>
          </span>
        </button>
      </div>

      {/* Zona 3: Ações Principais do Sistema */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRunAnalyze}
          disabled={isAnalyzing}
          title="Executa leitura e diagnóstico completo de hardware e processos"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2D2D2D] hover:bg-[#383838] text-white border border-[#3E3E3E] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          <Search size={13} className={isAnalyzing ? 'animate-spin text-[#00E5FF]' : 'text-neutral-400'} />
          <span>{isAnalyzing ? 'ANALISANDO...' : 'ANALISAR'}</span>
        </button>

        <button
          onClick={onRunDryRun}
          title="Simula as ações de otimização sem aplicar nenhuma alteração real"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2D2D2D] hover:bg-[#383838] text-white border border-[#3E3E3E] transition-colors whitespace-nowrap cursor-pointer"
        >
          <SlidersHorizontal size={13} className="text-neutral-400" />
          <span>SIMULAR</span>
        </button>

        <button
          onClick={onToggleGamingMode}
          title="Ativa o Modo Jogo com rastreamento transacional no diário"
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            isGamingModeActive
              ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20 hover:bg-[#33EAFF]'
              : 'bg-[#242424] text-white border border-[#00E5FF]/40 hover:border-[#00E5FF] hover:bg-[#00E5FF]/10'
          }`}
        >
          <Gamepad2 size={14} className={isGamingModeActive ? 'text-black' : 'text-[#00E5FF]'} />
          <span>{isGamingModeActive ? 'JOGO ATIVADO' : 'MODO JOGO'}</span>
        </button>

        <button
          onClick={onRunRollback}
          disabled={!hasActiveRollback}
          title={hasActiveRollback ? 'Reverter todas as alterações para o estado inicial' : 'Nenhuma alteração ativa para reverter'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
            hasActiveRollback
              ? 'bg-[#2D2D2D] border-[#FFB300] text-[#FFB300] hover:bg-[#FFB300]/10'
              : 'bg-[#222222] border-[#333333] text-neutral-500 cursor-not-allowed opacity-60'
          }`}
        >
          <RotateCcw size={13} />
          <span className="hidden md:inline">REVERTER</span>
        </button>
      </div>
    </header>
  );
};
