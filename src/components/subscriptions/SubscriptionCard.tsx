'use client';

import React from 'react';
import {
  Subscription,
  SubscriptionAnalysis,
  UserDecision,
  SubscriptionStatus,
} from '@/types/subscription';
import { formatCurrencyINR, formatDate } from '@/lib/calculations';
import {
  Calendar,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  TrendingDown,
  Layers,
  Coins,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface SubscriptionCardProps {
  subscription: Subscription;
  analysis?: SubscriptionAnalysis;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onUpdateDecision: (id: string, decision: UserDecision) => void;
  onUpdateStatus: (id: string, status: SubscriptionStatus) => void;
}

export function SubscriptionCard({
  subscription,
  analysis,
  onEdit,
  onDelete,
  onUpdateDecision,
  onUpdateStatus,
}: SubscriptionCardProps) {
  const isCanceled = subscription.status === 'canceled';
  const isPaused = subscription.status === 'paused';

  const isDecisionCancel = subscription.decision === 'cancel';
  const isDecisionPause = subscription.decision === 'pause';
  const isDecisionDowngrade = subscription.decision === 'downgrade';

  return (
    <div
      className={`rounded-2xl bg-[#0E131E] border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isCanceled
          ? 'border-slate-800/60 opacity-60'
          : isPaused
          ? 'border-amber-900/40 opacity-80'
          : isDecisionCancel
          ? 'border-rose-900/60 shadow-md shadow-rose-950/20'
          : isDecisionPause
          ? 'border-sky-900/60 shadow-md shadow-sky-950/20'
          : analysis?.riskLevel === 'urgent'
          ? 'border-red-600/70 shadow-lg shadow-red-950/20'
          : analysis?.riskLevel === 'high'
          ? 'border-rose-800/60'
          : 'border-[#1B2232] hover:border-[#27324A]'
      }`}
    >
      {/* Top Section: Header & Badges */}
      <div className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-white tracking-tight">
                {subscription.name}
              </h3>
              <Badge variant="status" status={subscription.status} size="sm">
                {subscription.status}
              </Badge>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-300">{subscription.category}</span>
              {analysis?.hasOverlapWithOther && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800/40 font-mono"
                  title={`Overlap with ${analysis.overlappingServiceNames.join(', ')}`}
                >
                  <Layers className="w-3 h-3" />
                  Overlap
                </span>
              )}
            </div>
          </div>

          {/* Edit / Delete Icon Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(subscription)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#161C29] transition-colors"
              title="Edit subscription"
              aria-label={`Edit ${subscription.name}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(subscription.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Delete subscription"
              aria-label={`Delete ${subscription.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* User Decision Status Banner */}
        <div
          className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs border ${
            isDecisionCancel
              ? 'bg-rose-950/40 border-rose-800/50 text-rose-300'
              : isDecisionPause
              ? 'bg-sky-950/40 border-sky-800/50 text-sky-300'
              : isDecisionDowngrade
              ? 'bg-purple-950/40 border-purple-800/50 text-purple-300'
              : subscription.decision === 'review'
              ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
              : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium">
            {isDecisionCancel || isDecisionPause ? (
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              Decision: <strong className="capitalize">{subscription.decision}</strong>
            </span>
          </div>

          {(isDecisionCancel || isDecisionPause) && (
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              (Pending provider action)
            </span>
          )}
        </div>

        {/* Pricing Line */}
        <div className="flex items-baseline justify-between pt-1 border-t border-[#1B2232]">
          <div>
            <span className="text-2xl font-bold text-white tracking-tight font-mono">
              {formatCurrencyINR(subscription.price)}
            </span>
            <span className="text-xs text-slate-400 ml-1">
              / {subscription.billingCycle === 'custom' ? `${subscription.customBillingDays || 30}d` : subscription.billingCycle}
            </span>
          </div>

          {subscription.billingCycle !== 'monthly' && analysis && (
            <div className="text-xs text-slate-400 font-mono">
              ~{formatCurrencyINR(analysis.monthlyEquivalent)}/mo
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          {/* Renewal Countdown */}
          <div className="p-2.5 rounded-xl bg-[#08090C] border border-[#1B2232]">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#D4F940]" />
              <span className="text-[11px]">Next Renewal</span>
            </div>
            <div className="font-semibold text-slate-200 text-xs">
              {formatDate(subscription.nextRenewalDate)}
            </div>
            {analysis && (
              <div
                className={`text-[10px] font-mono font-medium mt-0.5 ${
                  analysis.daysUntilRenewal <= 7
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {analysis.daysUntilRenewal <= 0
                  ? 'Renews today'
                  : analysis.daysUntilRenewal === 1
                  ? 'Renews tomorrow'
                  : `In ${analysis.daysUntilRenewal} days`}
              </div>
            )}
          </div>

          {/* Last Used / Frequency */}
          <div className="p-2.5 rounded-xl bg-[#08090C] border border-[#1B2232]">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#C4B5FD]" />
              <span className="text-[11px]">Usage Activity</span>
            </div>
            <div className="font-semibold capitalize text-slate-200 text-xs">
              {subscription.usageFrequency}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">
              {analysis?.daysSinceLastUse !== null && analysis?.daysSinceLastUse !== undefined
                ? analysis.daysSinceLastUse === 0
                  ? 'Used today'
                  : `${analysis.daysSinceLastUse}d ago`
                : 'Not logged'}
            </div>
          </div>
        </div>

        {/* Estimated cost per use */}
        {analysis?.estimatedCostPerUse !== null && analysis?.estimatedCostPerUse !== undefined && (
          <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-[#08090C] text-slate-400 border border-[#1B2232]">
            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              Est. Cost Per Use:
            </span>
            <span className="font-mono font-semibold text-[#D4F940]">
              {formatCurrencyINR(analysis.estimatedCostPerUse)}
            </span>
          </div>
        )}

        {/* Recommendation Engine Box */}
        {analysis && !isCanceled && (
          <div
            className={`p-3 rounded-xl border text-xs space-y-1.5 ${
              analysis.riskLevel === 'urgent'
                ? 'bg-red-950/40 border-red-800/60 text-red-200'
                : analysis.riskLevel === 'high'
                ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                : analysis.riskLevel === 'moderate'
                ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 font-semibold text-xs">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{analysis.recommendationTitle}</span>
              </div>
              <Badge variant="risk" riskLevel={analysis.riskLevel} size="sm">
                {analysis.riskLevel}
              </Badge>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">
              {analysis.recommendationReason}
            </p>
            {analysis.potentialYearlySavings > 0 && (
              <div className="text-[11px] font-semibold text-[#D4F940] pt-0.5 flex items-center gap-1 font-mono">
                <TrendingDown className="w-3 h-3" />
                Potential Savings: {formatCurrencyINR(analysis.potentialYearlySavings)}/yr
              </div>
            )}
          </div>
        )}

        {/* Optional Notes */}
        {subscription.notes && (
          <p className="text-xs text-slate-400 italic line-clamp-2 px-1">
            &quot;{subscription.notes}&quot;
          </p>
        )}
      </div>

      {/* Bottom Footer: Quick Status & Decision Toggles */}
      <div className="p-3.5 bg-[#08090C] border-t border-[#1B2232] flex flex-col gap-2.5 text-xs">
        {/* Quick Decision Action Pills */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] text-slate-400 font-medium">Decision:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {(['keep', 'review', 'downgrade', 'pause', 'cancel'] as UserDecision[]).map((action) => {
              const isSelected = subscription.decision === action;
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => onUpdateDecision(subscription.id, action)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg capitalize font-medium transition-all ${
                    isSelected
                      ? action === 'cancel'
                        ? 'bg-rose-950 text-rose-300 border border-rose-600 font-bold'
                        : action === 'pause'
                        ? 'bg-sky-950 text-sky-300 border border-sky-600 font-bold'
                        : action === 'downgrade'
                        ? 'bg-purple-950 text-purple-300 border border-purple-600 font-bold'
                        : action === 'review'
                        ? 'bg-amber-950 text-amber-300 border border-amber-600 font-bold'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold'
                      : 'bg-[#121622] text-slate-400 hover:text-slate-200 border border-[#1B2232]'
                  }`}
                  title={`Set decision to ${action}`}
                >
                  {action}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Toggle & Provider Reminder */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1B2232] text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span>Provider Status:</span>
            <select
              value={subscription.status}
              onChange={(e) =>
                onUpdateStatus(subscription.id, e.target.value as SubscriptionStatus)
              }
              aria-label={`Real-world status for ${subscription.name}`}
              className="text-[11px] px-2 py-0.5 rounded-md bg-[#121622] border border-[#1B2232] text-slate-200 capitalize focus:outline-none focus:border-[#D4F940] cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="paused">Paused</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <span className="text-[10px] text-slate-500 italic hidden sm:inline">
            Tracks actual card debit
          </span>
        </div>
      </div>
    </div>
  );
}
