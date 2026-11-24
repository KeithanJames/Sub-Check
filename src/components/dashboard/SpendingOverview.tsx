'use client';

import React from 'react';
import { FinancialSummary, SubscriptionCategory } from '@/types/subscription';
import { formatCurrencyINR } from '@/lib/calculations';
import { PieChart, ShieldAlert } from 'lucide-react';

interface SpendingOverviewProps {
  summary: FinancialSummary;
  onSelectCategory?: (category: SubscriptionCategory) => void;
}

export function SpendingOverview({ summary, onSelectCategory }: SpendingOverviewProps) {
  // Extract categories with non-zero spending and sort descending
  const activeCategories = (
    Object.entries(summary.categorySpending) as [SubscriptionCategory, number][]
  )
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a);

  const totalMonthly = summary.totalMonthlySpending || 1; // Prevent div by 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Category Spending Breakdown (2 cols) */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-[#131927] border border-[#1E293B]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-accent" />
            <h3 className="text-sm font-semibold text-white">Monthly Category Allocation</h3>
          </div>
          <span className="text-xs text-slate-400">
            {activeCategories.length} active {activeCategories.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {activeCategories.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No active subscription spending recorded yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {activeCategories.map(([category, amount]) => {
              const percentage = Math.round((amount / totalMonthly) * 100);
              return (
                <div
                  key={category}
                  onClick={() => onSelectCategory?.(category)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-300 group-hover:text-purple-300 transition-colors">
                      {category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono">{percentage}%</span>
                      <span className="font-semibold text-white font-mono">
                        {formatCurrencyINR(amount)}/mo
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500 group-hover:from-purple-500 group-hover:to-indigo-400"
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Risk & Waste Posture (1 col) */}
      <div className="p-5 rounded-2xl bg-[#131927] border border-[#1E293B] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Waste & Risk Posture</h3>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Urgent Risk
              </span>
              <span className="text-xs font-mono font-bold text-red-400">
                {summary.riskBreakdown.urgent}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                High Risk (Likely Unused)
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">
                {summary.riskBreakdown.high}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Moderate Risk (Review)
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {summary.riskBreakdown.moderate}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Low Risk (Actively Used)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {summary.riskBreakdown.low}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          The waste engine recalculates dynamically as you update usage frequencies and renewal dates.
        </div>
      </div>
    </div>
  );
}
