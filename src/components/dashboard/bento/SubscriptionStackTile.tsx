'use client';

import React from 'react';
import { FinancialSummary, Subscription } from '@/types/subscription';
import { formatCurrencyINR } from '@/lib/calculations';
import { Layers, ChevronRight, CheckCircle2 } from 'lucide-react';

interface SubscriptionStackTileProps {
  summary: FinancialSummary;
  subscriptions: Subscription[];
  onOpenSubscriptions: () => void;
}

export function SubscriptionStackTile({
  summary,
  subscriptions,
  onOpenSubscriptions,
}: SubscriptionStackTileProps) {
  // Grab top 3 active subscriptions for visual stack
  const topActive = subscriptions
    .filter((s) => s.status === 'active' || s.status === 'trial')
    .slice(0, 3);

  return (
    <div
      onClick={onOpenSubscriptions}
      className="bento-tile p-5 flex flex-col justify-between col-span-1 cursor-pointer group hover:border-[#D4F940]/40 relative overflow-hidden"
    >
      {/* Top Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#141A27] text-slate-300 border border-[#232B3E]">
            <Layers className="w-4 h-4 text-[#D4F940]" />
          </div>
          <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
            Subscription Stack
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#D4F940] group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Main Large Count */}
      <div className="my-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white font-mono">
            {summary.activeCount}
          </span>
          <span className="text-xs text-[#D4F940] font-semibold uppercase tracking-wider">
            Active Services
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {formatCurrencyINR(summary.totalMonthlySpending)} / month combined
        </p>
      </div>

      {/* Visual Mini Stack Preview */}
      <div className="space-y-1.5 my-2">
        {topActive.map((sub, i) => (
          <div
            key={sub.id}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#141A27] border border-[#202738] text-xs transition-colors group-hover:border-slate-700"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4F940]" />
              <span className="font-medium text-slate-200 truncate">{sub.name}</span>
            </div>
            <span className="font-mono text-slate-400 shrink-0 text-[11px]">
              {formatCurrencyINR(sub.price)}/{sub.billingCycle.slice(0, 2)}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Status Breakdown Pill */}
      <div className="pt-2 border-t border-[#1B2232] flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <CheckCircle2 className="w-3 h-3 text-[#D4F940]" />
          Healthy billing
        </span>
        <span className="font-mono text-slate-400">
          {summary.trialCount} trial • {summary.pausedCount} paused
        </span>
      </div>
    </div>
  );
}
