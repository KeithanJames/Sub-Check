'use client';

import React from 'react';
import {
  Subscription,
  SubscriptionAnalysis,
  UserDecision,
} from '@/types/subscription';
import { formatCurrencyINR } from '@/lib/calculations';
import { ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface AttentionPanelProps {
  attentionSubscriptions: Subscription[];
  analyses: Map<string, SubscriptionAnalysis>;
  onUpdateDecision: (id: string, decision: UserDecision) => void;
  onSelectSubscription: (sub: Subscription) => void;
}

const DECISION_ACTIONS: { id: UserDecision; label: string; activeColor: string }[] = [
  {
    id: 'keep',
    label: 'Keep',
    activeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-600 shadow-sm shadow-emerald-950/40',
  },
  {
    id: 'review',
    label: 'Review',
    activeColor: 'bg-amber-950/80 text-amber-300 border-amber-600 shadow-sm shadow-amber-950/40',
  },
  {
    id: 'downgrade',
    label: 'Downgrade',
    activeColor: 'bg-purple-950/80 text-purple-300 border-purple-600 shadow-sm shadow-purple-950/40',
  },
  {
    id: 'pause',
    label: 'Pause',
    activeColor: 'bg-sky-950/80 text-sky-300 border-sky-600 shadow-sm shadow-sky-950/40',
  },
  {
    id: 'cancel',
    label: 'Cancel',
    activeColor: 'bg-rose-950/80 text-rose-300 border-rose-600 shadow-sm shadow-rose-950/40',
  },
];

export function AttentionPanel({
  attentionSubscriptions,
  analyses,
  onUpdateDecision,
  onSelectSubscription,
}: AttentionPanelProps) {
  if (attentionSubscriptions.length === 0) {
    return (
      <div className="bento-tile p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-white">No Waste Alerts Detected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          All your active subscriptions are frequently used or verified. Great job keeping your recurring expenses lean!
        </p>
      </div>
    );
  }

  return (
    <div className="bento-tile p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#141B2A] text-[#D4F940] border border-[#D4F940]/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Subscriptions Requiring Attention
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic waste detection highlights subscriptions you may want to review, pause, or cancel.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-medium text-[#D4F940] bg-[#141B2A] px-2.5 py-1 rounded-full border border-[#D4F940]/30">
          {attentionSubscriptions.length} flagged
        </span>
      </div>

      <div className="space-y-3">
        {attentionSubscriptions.map((sub) => {
          const analysis = analyses.get(sub.id);
          if (!analysis) return null;

          const isPendingCancellation = sub.decision === 'cancel';
          const isPendingPause = sub.decision === 'pause';

          return (
            <div
              key={sub.id}
              className={`p-4 rounded-xl bg-[#08090C] border transition-all space-y-3 ${
                isPendingCancellation
                  ? 'border-rose-900/50 bg-[#120D17]'
                  : isPendingPause
                  ? 'border-sky-900/50 bg-[#0D131E]'
                  : 'border-[#1B2232] hover:border-[#27324A]'
              }`}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div
                  onClick={() => onSelectSubscription(sub)}
                  className="cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white group-hover:text-[#D4F940] transition-colors">
                      {sub.name}
                    </span>
                    <span className="text-xs text-slate-400">({sub.category})</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">
                    {formatCurrencyINR(sub.price)}/{sub.billingCycle} • Renewal in {analysis.daysUntilRenewal}d
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant="risk" riskLevel={analysis.riskLevel} size="sm">
                    {analysis.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="action" action={analysis.recommendedAction} size="sm">
                    {analysis.recommendationTitle}
                  </Badge>
                </div>
              </div>

              {/* Rationale & Explanation */}
              <div className="p-3 rounded-lg bg-[#0E131E] border border-[#1B2232] text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4F940] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span>{analysis.recommendationReason}</span>
                  {analysis.potentialYearlySavings > 0 && (
                    <span className="block font-medium text-[#D4F940] font-mono">
                      Potential Annual Savings: {formatCurrencyINR(analysis.potentialYearlySavings)}/year
                    </span>
                  )}
                </div>
              </div>

              {/* Action Required Reminder for Cancel / Pause */}
              {(isPendingCancellation || isPendingPause) && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Provider action required:</strong> Decision to{' '}
                    <span className="underline font-semibold">{sub.decision}</span> logged.
                    Remember to {sub.decision} directly on {sub.name} before{' '}
                    {analysis.daysUntilRenewal} days to stop credit card charges.
                  </span>
                </div>
              )}

              {/* Decision Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1B2232]">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Decision:</span>
                  <span
                    className={`font-semibold capitalize px-2 py-0.5 rounded-md text-[11px] ${
                      sub.decision === 'cancel'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : sub.decision === 'pause'
                        ? 'bg-sky-950 text-sky-300 border border-sky-800'
                        : sub.decision === 'downgrade'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : sub.decision === 'review'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {sub.decision}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {DECISION_ACTIONS.map((item) => {
                    const isSelected = sub.decision === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onUpdateDecision(sub.id, item.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                          isSelected
                            ? `${item.activeColor} font-semibold ring-1 ring-white/10`
                            : 'bg-[#121622] text-slate-300 hover:bg-[#182030] border border-[#1B2232] hover:text-white'
                        }`}
                        title={`Select decision: ${item.label}`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
