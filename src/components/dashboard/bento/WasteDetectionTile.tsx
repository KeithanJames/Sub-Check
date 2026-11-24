'use client';

import React from 'react';
import { FinancialSummary, Subscription, SubscriptionAnalysis } from '@/types/subscription';
import { formatCurrencyINR } from '@/lib/calculations';
import { ShieldAlert, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

interface WasteDetectionTileProps {
  summary: FinancialSummary;
  attentionSubscriptions: Subscription[];
  analyses: Map<string, SubscriptionAnalysis>;
  onOpenWasteTab: () => void;
}

export function WasteDetectionTile({
  summary,
  attentionSubscriptions,
  analyses,
  onOpenWasteTab,
}: WasteDetectionTileProps) {
  // Highest priority unused subscription
  const topFlagged = attentionSubscriptions[0];
  const topAnalysis = topFlagged ? analyses.get(topFlagged.id) : null;

  return (
    <div
      onClick={onOpenWasteTab}
      className="bento-tile bento-tile-highlight p-5 flex flex-col justify-between col-span-1 cursor-pointer group relative overflow-hidden"
    >
      {/* Background Subtle Lime Glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#D4F940]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#D4F940]/15 text-[#D4F940] border border-[#D4F940]/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase font-semibold tracking-wider text-[#D4F940]">
            Waste Detection
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800/60 font-semibold animate-pulse">
          {summary.requiringAttentionCount} Flagged
        </span>
      </div>

      {/* Potential Annual Savings */}
      <div className="my-3 relative z-10">
        <span className="text-[11px] text-slate-400 block">Identified Annual Waste</span>
        <div className="text-3xl font-black text-white font-mono mt-0.5 tracking-tight">
          <span className="text-[#D4F940]">
            {formatCurrencyINR(summary.potentialAnnualSavings)}
          </span>
          <span className="text-xs font-normal text-slate-400"> /year</span>
        </div>
      </div>

      {/* Highest Priority Target Callout */}
      {topFlagged && topAnalysis ? (
        <div className="p-2.5 rounded-xl bg-[#141B28] border border-[#222E42] text-xs relative z-10 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-white flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
              {topFlagged.name}
            </span>
            <span className="font-mono text-rose-400 font-semibold">
              Renews in {topAnalysis.daysUntilRenewal}d
            </span>
          </div>
          <p className="text-[10px] text-slate-400 line-clamp-1">
            {topAnalysis.daysSinceLastUse !== null
              ? `No activity for ${topAnalysis.daysSinceLastUse} days`
              : 'Marked as rarely/never used'}
          </p>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-[#141B28] border border-[#222E42] text-xs text-slate-400 relative z-10">
          No urgent waste flags detected right now.
        </div>
      )}

      {/* CTA Button */}
      <div className="pt-3 border-t border-[#1B2232] mt-2 relative z-10 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#D4F940] group-hover:underline flex items-center gap-1">
          <span>Review Recommendations</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
        <Sparkles className="w-3.5 h-3.5 text-[#D4F940]/70" />
      </div>
    </div>
  );
}
