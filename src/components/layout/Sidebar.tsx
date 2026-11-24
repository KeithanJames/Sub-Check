'use client';

import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  ShieldAlert,
  CalendarClock,
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  TrendingDown,
} from 'lucide-react';
import { FinancialSummary } from '@/types/subscription';
import { formatCurrencyINR } from '@/lib/calculations';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  summary: FinancialSummary;
  onResetDemo: () => void;
  onExport: () => void;
  onTriggerImport: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  currentTab,
  onTabChange,
  summary,
  onResetDemo,
  onExport,
  onTriggerImport,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: CreditCard,
      badge: summary.activeCount > 0 ? String(summary.activeCount) : undefined,
    },
    {
      id: 'waste',
      label: 'Waste Engine',
      icon: ShieldAlert,
      badge: summary.requiringAttentionCount > 0 ? String(summary.requiringAttentionCount) : undefined,
      badgeColor: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    },
    {
      id: 'renewals',
      label: 'Renewals',
      icon: CalendarClock,
      badge: summary.renewingSoonCount > 0 ? String(summary.renewingSoonCount) : undefined,
      badgeColor: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#08090C] border-r border-[#1B2232] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand & Navigation */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#1B2232]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D4F940] to-[#80E626] flex items-center justify-center shadow-lg shadow-[#D4F940]/15">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white font-mono">
                  SubCheck
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium bg-[#131927] text-[#D4F940] border border-[#D4F940]/30">
                  FINTECH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Subscription Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#0E131E] text-white border border-[#27324A] shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E131E]/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#D4F940]' : 'text-slate-400'
                      }`}
                    />
                    <span className={isActive ? 'font-semibold text-white' : ''}>
                      {item.label}
                    </span>
                  </div>

                  {/* Active Indicator dot */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#D4F940]" />
                  )}

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                        item.badgeColor || 'bg-[#141B2A] text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Potential Savings Quick Glance Tile */}
          {summary.potentialAnnualSavings > 0 && (
            <div className="mt-auto pt-6">
              <div
                onClick={() => {
                  onTabChange('waste');
                  onCloseMobile();
                }}
                className="p-3.5 rounded-2xl bg-[#0E131E] border border-[#D4F940]/25 relative overflow-hidden group cursor-pointer hover:border-[#D4F940]/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#D4F940] flex items-center gap-1 font-mono">
                    <TrendingDown className="w-3 h-3" />
                    Identified Waste
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors">
                    Review &rarr;
                  </span>
                </div>
                <div className="text-lg font-bold text-white mt-1 font-mono tracking-tight">
                  {formatCurrencyINR(summary.potentialAnnualSavings)}
                  <span className="text-xs font-normal text-slate-400"> /year</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Reclaimable by pruning underutilized subscriptions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Utilities & Local Storage Actions */}
        <div className="p-4 border-t border-[#1B2232] space-y-2 bg-[#090C12]">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 font-mono">
            Data Persistence
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onExport}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#0E131E] hover:bg-[#151C2C] border border-[#1B2232] hover:text-white transition-colors"
              title="Export subscriptions to JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export</span>
            </button>
            <button
              onClick={onTriggerImport}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-[#0E131E] hover:bg-[#151C2C] border border-[#1B2232] hover:text-white transition-colors"
              title="Import subscriptions from JSON"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import</span>
            </button>
          </div>
          <button
            onClick={onResetDemo}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#0E131E] border border-transparent hover:border-[#1B2232] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
}
