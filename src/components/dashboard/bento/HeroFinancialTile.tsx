'use client';

import React from 'react';
import { FinancialSummary, Subscription } from '@/types/subscription';
import { formatCurrencyINR } from '@/lib/calculations';
import { TrendingUp, ArrowUpRight, Sparkles } from 'lucide-react';

interface HeroFinancialTileProps {
  summary: FinancialSummary;
  subscriptions: Subscription[];
  onOpenWasteTab: () => void;
}

export function HeroFinancialTile({
  summary,
  subscriptions,
  onOpenWasteTab,
}: HeroFinancialTileProps) {
  const dailyEquivalent = Math.round(summary.totalMonthlySpending / 30.4);

  // Generate SVG path for a 6-month projected spending curve
  // Simulated monthly projection points based on current active spending
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const baseMonthly = summary.totalMonthlySpending || 1999;
  
  // Subtle realistic curve variations around the baseline monthly spend
  const points = [
    { x: 30, y: 70, val: Math.round(baseMonthly * 0.94) },
    { x: 100, y: 62, val: Math.round(baseMonthly * 0.98) },
    { x: 170, y: 55, val: baseMonthly },
    { x: 240, y: 50, val: baseMonthly },
    { x: 310, y: 44, val: Math.round(baseMonthly * 1.02) },
    { x: 380, y: 38, val: baseMonthly },
  ];

  // SVG Cubic Bezier Path
  const svgPath = `M ${points[0].x} ${points[0].y} C 65 66, 135 58, ${points[2].x} ${points[2].y} C 205 52, 275 47, ${points[4].x} ${points[4].y} C 345 41, 360 39, ${points[5].x} ${points[5].y}`;
  const fillPath = `${svgPath} L 380 95 L 30 95 Z`;

  return (
    <div className="bento-tile p-6 flex flex-col justify-between col-span-1 md:col-span-2 relative overflow-hidden group">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4F940]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
              Monthly Active Run-Rate
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#D4F940]/10 text-[#D4F940] border border-[#D4F940]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4F940] animate-pulse" />
              Live
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-3 flex-wrap">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
              {formatCurrencyINR(summary.totalMonthlySpending)}
            </h2>
            <span className="text-xs text-slate-400 font-medium">/ month</span>
          </div>
        </div>

        {/* Action Badge */}
        {summary.potentialAnnualSavings > 0 && (
          <button
            onClick={onOpenWasteTab}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#D4F940]/10 hover:bg-[#D4F940]/20 text-[#D4F940] border border-[#D4F940]/30 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimize Spend</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Interactive SVG Trend Line Chart */}
      <div className="my-4 relative z-10">
        <div className="h-28 w-full relative">
          <svg
            viewBox="0 0 410 100"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="limeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D4F940" stopOpacity="0.25" />
                <stop offset="85%" stopColor="#D4F940" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Filled Area */}
            <path d={fillPath} fill="url(#limeGradient)" />

            {/* Smooth Curve */}
            <path
              d={svgPath}
              fill="none"
              stroke="#D4F940"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Data Points */}
            {points.map((p, i) => (
              <g key={i} className="group/point cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  className="fill-[#08090C] stroke-[#D4F940] stroke-2 hover:r-5 transition-all"
                />
              </g>
            ))}
          </svg>

          {/* Month Ticks */}
          <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1 px-3">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Metrics Sub-bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#1B2232] relative z-10 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Annual Expenditure</span>
          <span className="font-semibold text-white font-mono text-sm">
            {formatCurrencyINR(summary.totalAnnualSpending)}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">Daily Cost Equivalent</span>
          <span className="font-semibold text-white font-mono text-sm">
            ~{formatCurrencyINR(dailyEquivalent)} / day
          </span>
        </div>

        <div className="hidden sm:block">
          <span className="text-slate-400 block text-[11px]">Active Services</span>
          <span className="font-semibold text-[#D4F940] font-mono text-sm">
            {summary.activeCount} recurring
          </span>
        </div>
      </div>
    </div>
  );
}
