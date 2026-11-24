'use client';

import React from 'react';
import { FinancialSummary, SubscriptionCategory } from '@/types/subscription';
import { formatCurrencyINR } from '@/lib/calculations';
import { PieChart } from 'lucide-react';

interface SpendingAllocationTileProps {
  summary: FinancialSummary;
  onSelectCategory?: (category: SubscriptionCategory) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: '#D4F940', // Lime
  Music: '#C4B5FD', // Lavender
  Gaming: '#38BDF8', // Sky
  Productivity: '#10B981', // Emerald
  'Cloud Storage': '#F59E0B', // Amber
  Shopping: '#F43F5E', // Rose
  Fitness: '#A78BFA', // Purple
  News: '#FB7185', // Coral
  Education: '#34D399', // Mint
  Other: '#94A3B8', // Slate
};

export function SpendingAllocationTile({
  summary,
  onSelectCategory,
}: SpendingAllocationTileProps) {
  const activeCategories = (
    Object.entries(summary.categorySpending) as [SubscriptionCategory, number][]
  )
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a);

  const totalMonthly = summary.totalMonthlySpending || 1;

  return (
    <div className="bento-tile p-5 flex flex-col justify-between col-span-1 md:col-span-2 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#141A27] text-slate-300 border border-[#232B3E]">
            <PieChart className="w-4 h-4 text-[#D4F940]" />
          </div>
          <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
            Spending Allocation by Category
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {activeCategories.length} categories
        </span>
      </div>

      {/* Segmented Horizontal Allocation Bar */}
      <div className="my-3">
        <div className="w-full h-3 rounded-full bg-[#141A27] overflow-hidden flex gap-0.5 p-0.5 border border-[#1E2536]">
          {activeCategories.map(([cat, amount]) => {
            const pct = (amount / totalMonthly) * 100;
            const color = CATEGORY_COLORS[cat] || '#94A3B8';
            return (
              <div
                key={cat}
                style={{ width: `${pct}%`, backgroundColor: color }}
                className="h-full rounded-sm transition-all duration-300 hover:opacity-80"
                title={`${cat}: ${Math.round(pct)}% (${formatCurrencyINR(amount)})`}
              />
            );
          })}
        </div>
      </div>

      {/* Compact Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
        {activeCategories.map(([cat, amount]) => {
          const pct = Math.round((amount / totalMonthly) * 100);
          const color = CATEGORY_COLORS[cat] || '#94A3B8';
          return (
            <div
              key={cat}
              onClick={() => onSelectCategory?.(cat)}
              className="flex items-center justify-between p-2 rounded-xl bg-[#141A27]/60 hover:bg-[#182030] border border-[#1E2536] cursor-pointer transition-all text-xs group"
            >
              <div className="flex items-center gap-1.5 truncate pr-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-300 group-hover:text-white truncate font-medium">
                  {cat}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-white text-[11px] font-semibold block">
                  {formatCurrencyINR(amount)}
                </span>
                <span className="font-mono text-slate-400 text-[10px] block">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
