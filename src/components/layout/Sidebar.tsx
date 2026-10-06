/**
 * OptiWinX Otimizador e Diagnóstico Nativo do Windows v2.0
 * Componente: Sidebar.tsx (Português do Brasil)
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Cpu, 
  Gauge, 
  Gamepad2, 
  Terminal, 
  FileText,
  Shield,
  Layers,
  HardDrive
} from 'lucide-react';
import { ElevationState } from '../../types/optiwin';

export type NavTabId = 
  | 'dashboard'
  | 'monitor'
  | 'processes'
  | 'bottlenecks'
  | 'gaming'
  | 'startup-cleanup'
  | 'cpp-engine'
  | 'logs';

interface SidebarProps {
  currentTab: NavTabId;
  setCurrentTab: (tab: NavTabId) => void;
  isOpen: boolean;
  onClose: () => void;
  activeTransactionsCount: number;
  elevation: ElevationState;
}

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
  activeTransactionsCount,
  elevation
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Visão Geral do Sistema',
      icon: <LayoutDashboard size={18} />
    },
    {
      id: 'monitor',
      label: 'Telemetria de Hardware',
      icon: <Activity size={18} />
    },
    {
      id: 'processes',
      label: 'Inteligência de Processos',
      icon: <Cpu size={18} />
    },
    {
      id: 'bottlenecks',
      label: 'Análise de Gargalos',
      icon: <Gauge size={18} />
    },
    {
      id: 'gaming',
      label: 'Modo Jogo e Diário',
      icon: <Gamepad2 size={18} />,
      badge: activeTransactionsCount > 0 ? activeTransactionsCount : undefined
    },
    {
      id: 'startup-cleanup',
      label: 'Inicialização e Limpeza',
      icon: <HardDrive size={18} />
    },
    {
      id: 'cpp-engine',
      label: 'Motor C++20 e Terminal',
      icon: <Terminal size={18} />
    },
    {
      id: 'logs',
      label: 'Auditoria de Transações',
      icon: <FileText size={18} />
    }
  ];

  const handleSelect = (tab: NavTabId) => {
    setCurrentTab(tab);
    onClose();
  };

  return (
    <>
      {/* Fundo Escuro para Dispositivos Móveis */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Barra Lateral Principal */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#181818] border-r border-[#2B2B2B] flex flex-col transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Cabeçalho da Barra Lateral */}
        <div className="p-4 border-b border-[#252525] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="text-[#00E5FF]" size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Painel de Controle
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500 tabular-nums">
            Nativo x64
          </span>
        </div>

        {/* Lista de Módulos */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Módulos do Sistema
          </div>

          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left group cursor-pointer ${
                  isActive
                    ? 'bg-[#2A2A2A] text-white shadow-xs font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#222222]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-[#00E5FF]' : 'text-neutral-500 group-hover:text-neutral-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="font-mono text-[10px] tabular-nums font-semibold px-1.5 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Rodapé de Sobrecarga e Recursos (Seção 31) */}
        <div className="p-3.5 border-t border-[#252525] bg-[#151515] text-[11px] space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Shield size={12} className={elevation === 'ADMINISTRADOR' ? 'text-[#00E5FF]' : 'text-neutral-500'} />
              Privilégio
            </span>
            <span className="font-mono font-medium text-neutral-300">
              {elevation}
            </span>
          </div>

          <div className="flex items-center justify-between text-neutral-500 pt-1 border-t border-[#222222]">
            <span>Uso de CPU do App</span>
            <span className="font-mono tabular-nums text-neutral-300">
              0,18%
            </span>
          </div>

          <div className="flex items-center justify-between text-neutral-500">
            <span>Memória de Trabalho</span>
            <span className="font-mono tabular-nums text-neutral-300">
              18,2 MB
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
