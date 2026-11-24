'use client';

import React from 'react';
import { FinancialSummary } from '@/types/subscription';
import { formatCurrencyINR } from '@/lib/calculations';
import {
  CreditCard,
  PiggyBank,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface StatsCardsProps {
  summary: FinancialSummary;
}

export function StatsCards({ summary }: StatsCardsProps) {
  const cards = [
    {
      title: 'Current Monthly Spending',
      value: formatCurrencyINR(summary.totalMonthlySpending),
      subtext: `Active & trial subscriptions: ${formatCurrencyINR(summary.totalAnnualSpending)} / year`,
      icon: CreditCard,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/30',
      borderColor: 'border-purple-800/40',
    },
    {
      title: 'Planned Decision Savings',
      value: formatCurrencyINR(summary.decisionSavings),
      subtext:
        summary.decisionSavings > 0
          ? `${summary.pendingCancellationsCount} cancellations & ${summary.pendingPausesCount} pauses planned`
          : 'Select Cancel, Pause or Downgrade to plan savings',
      icon: PiggyBank,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/30',
      borderColor: 'border-emerald-800/40',
      badge: summary.decisionSavings > 0 ? 'Your Plan' : undefined,
      badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    },
    {
      title: 'Engine Waste Potential',
      value: formatCurrencyINR(summary.potentialAnnualSavings),
      subtext: `${summary.requiringAttentionCount} subscriptions flagged as underutilized`,
      icon: TrendingDown,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/30',
      borderColor: 'border-amber-800/40',
      badge: summary.potentialAnnualSavings > 0 ? 'Algorithmic' : undefined,
      badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700',
    },
    {
      title: 'Active Subscriptions',
      value: String(summary.activeCount),
      subtext: `${summary.trialCount} trial • ${summary.pausedCount} paused • ${summary.canceledCount} canceled`,
      icon: Activity,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/30',
      borderColor: 'border-sky-800/40',
      warning:
        summary.requiringAttentionCount > 0
          ? `${summary.requiringAttentionCount} need review`
          : undefined,
    },
  ];

  return (
    <div className="space-y-3">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#131927] border border-[#1E293B] shadow-sm relative overflow-hidden transition-all hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bgColor} ${card.borderColor} border`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-2xl font-bold tracking-tight text-white">{card.value}</div>
                {card.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">{card.subtext}</span>
                {card.warning && (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-medium shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {card.warning}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Health & Savings Breakdown Strip */}
      <div className="p-3.5 rounded-xl bg-[#0E131F] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-slate-400">Financial Audit Breakdown:</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-slate-300">
          <div>
            <span className="text-slate-400 text-[11px] block">Current Annual Drain:</span>
            <span className="font-semibold text-white font-mono">
              {formatCurrencyINR(summary.totalAnnualSpending)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block">Your Planned Savings:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {formatCurrencyINR(summary.decisionSavings)}
              <span className="text-[10px] font-normal text-slate-400"> (action with provider)</span>
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block">Engine Waste Opportunities:</span>
            <span className="font-semibold text-amber-400 font-mono">
              {formatCurrencyINR(summary.potentialAnnualSavings)}
            </span>
          </div>

          {summary.actualRealizedSavings > 0 && (
            <div>
              <span className="text-slate-400 text-[11px] block">Actually Saved (Canceled):</span>
              <span className="font-semibold text-emerald-300 font-mono flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                {formatCurrencyINR(summary.actualRealizedSavings)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
