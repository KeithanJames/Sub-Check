'use client';

import React, { useState } from 'react';
import {
  Subscription,
  SubscriptionAnalysis,
  UserDecision,
  SubscriptionStatus,
} from '@/types/subscription';
import { formatCurrencyINR, formatDate } from '@/lib/calculations';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Coins,
  Sparkles,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  filteredSubscriptions: Subscription[];
  analyses: Map<string, SubscriptionAnalysis>;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onUpdateDecision: (id: string, decision: UserDecision) => void;
  onUpdateStatus: (id: string, status: SubscriptionStatus) => void;
  onOpenAddModal: () => void;
  onResetFilters: () => void;
}

export function SubscriptionTable({
  subscriptions,
  filteredSubscriptions,
  analyses,
  onEdit,
  onDelete,
  onUpdateDecision,
  onUpdateStatus,
  onOpenAddModal,
  onResetFilters,
}: SubscriptionTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (subscriptions.length === 0) {
    return (
      <div className="bento-tile p-12 text-center">
        <h3 className="text-base font-semibold text-white">No subscriptions tracked yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Add your first subscription to monitor renewals, usage metrics, and uncover potential savings.
        </p>
        <button
          onClick={onOpenAddModal}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-black bg-[#D4F940] hover:bg-[#C4EB2E] transition-all"
        >
          + Add First Subscription
        </button>
      </div>
    );
  }

  if (filteredSubscriptions.length === 0) {
    return (
      <div className="bento-tile p-10 text-center">
        <h3 className="text-sm font-semibold text-white">No matching subscriptions</h3>
        <p className="text-xs text-slate-400 mt-1">
          No entries matched your current search or category filter.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-3 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-[#161C29] border border-slate-700 hover:text-white"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bento-tile overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="bg-[#090C13] border-b border-[#1B2232] text-slate-400 text-[11px] uppercase font-mono tracking-wider">
            <tr>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-3">Price</th>
              <th className="py-3 px-3">Next Renewal</th>
              <th className="py-3 px-3">Usage</th>
              <th className="py-3 px-3">Risk Level</th>
              <th className="py-3 px-3">Your Decision</th>
              <th className="py-3 px-3">Provider Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#171E2D]">
            {filteredSubscriptions.map((sub) => {
              const analysis = analyses.get(sub.id);
              const isExpanded = expandedId === sub.id;
              const daysLeft = analysis?.daysUntilRenewal ?? 0;
              const isCanceled = sub.status === 'canceled';

              return (
                <React.Fragment key={sub.id}>
                  <tr
                    className={`hover:bg-[#121825]/70 transition-colors ${
                      isCanceled ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Service & Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpand(sub.id)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="Toggle details"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#D4F940]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <div>
                          <span className="font-semibold text-slate-100 text-xs block">
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            {sub.category}
                            {analysis?.hasOverlapWithOther && (
                              <span className="text-amber-400 font-semibold">• Overlap</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price & Billing */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-white block">
                        {formatCurrencyINR(sub.price)}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        / {sub.billingCycle}
                      </span>
                    </td>

                    {/* Next Renewal */}
                    <td className="py-3 px-3">
                      <span className="text-slate-300 block">
                        {formatDate(sub.nextRenewalDate)}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-medium ${
                          daysLeft <= 3
                            ? 'text-rose-400 font-bold'
                            : daysLeft <= 7
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {daysLeft === 0
                          ? 'Today'
                          : daysLeft === 1
                          ? 'Tomorrow'
                          : `in ${daysLeft} days`}
                      </span>
                    </td>

                    {/* Usage Activity */}
                    <td className="py-3 px-3">
                      <span className="capitalize text-slate-200 font-medium block">
                        {sub.usageFrequency}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {analysis?.daysSinceLastUse !== null && analysis?.daysSinceLastUse !== undefined
                          ? `${analysis.daysSinceLastUse}d ago`
                          : 'No date logged'}
                      </span>
                    </td>

                    {/* Risk Level Badge */}
                    <td className="py-3 px-3">
                      <Badge variant="risk" riskLevel={analysis?.riskLevel} size="sm">
                        {analysis?.riskLevel.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Interactive Decision Selector */}
                    <td className="py-3 px-3">
                      <select
                        value={sub.decision}
                        onChange={(e) =>
                          onUpdateDecision(sub.id, e.target.value as UserDecision)
                        }
                        aria-label={`Decision for ${sub.name}`}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium capitalize cursor-pointer focus:outline-none ${
                          sub.decision === 'cancel'
                            ? 'bg-rose-950/70 text-rose-300 border-rose-800'
                            : sub.decision === 'pause'
                            ? 'bg-sky-950/70 text-sky-300 border-sky-800'
                            : sub.decision === 'downgrade'
                            ? 'bg-purple-950/70 text-purple-300 border-purple-800'
                            : sub.decision === 'review'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        <option value="keep">Keep</option>
                        <option value="review">Review</option>
                        <option value="downgrade">Downgrade</option>
                        <option value="pause">Pause</option>
                        <option value="cancel">Cancel</option>
                      </select>
                    </td>

                    {/* Provider Status Selector */}
                    <td className="py-3 px-3">
                      <select
                        value={sub.status}
                        onChange={(e) =>
                          onUpdateStatus(sub.id, e.target.value as SubscriptionStatus)
                        }
                        aria-label={`Status for ${sub.name}`}
                        className="text-[11px] px-2 py-1 rounded-lg bg-[#0C101A] border border-[#1E2536] text-slate-300 capitalize cursor-pointer focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="paused">Paused</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit subscription"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete subscription"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Detail Drawer */}
                  {isExpanded && (
                    <tr className="bg-[#0B0E17]/90 border-b border-[#1B2232]">
                      <td colSpan={8} className="p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          {/* Reason */}
                          <div className="p-3 rounded-xl bg-[#121622] border border-[#1E2536]">
                            <span className="text-[11px] text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#D4F940]" />
                              Waste Recommendation:
                            </span>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                              {analysis?.recommendationReason}
                            </p>
                            {analysis && analysis.potentialYearlySavings > 0 && (
                              <span className="block mt-1 font-semibold text-[#D4F940] text-[11px]">
                                Potential Annual Savings: {formatCurrencyINR(analysis.potentialYearlySavings)}
                              </span>
                            )}
                          </div>

                          {/* Financial Detail */}
                          <div className="p-3 rounded-xl bg-[#121622] border border-[#1E2536] space-y-1">
                            <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                              Financial Metrics:
                            </span>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Monthly Run-rate:</span>
                              <span className="font-mono text-white">
                                {formatCurrencyINR(analysis?.monthlyEquivalent || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Annual Run-rate:</span>
                              <span className="font-mono text-white">
                                {formatCurrencyINR(analysis?.annualEquivalent || 0)}
                              </span>
                            </div>
                            {analysis?.estimatedCostPerUse && (
                              <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800">
                                <span className="text-slate-400">Est. Cost Per Use:</span>
                                <span className="font-mono text-[#D4F940]">
                                  {formatCurrencyINR(analysis.estimatedCostPerUse)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Notes & Provider Action Reminder */}
                          <div className="p-3 rounded-xl bg-[#121622] border border-[#1E2536] space-y-1.5">
                            <span className="text-[11px] text-slate-400 font-semibold block">
                              Notes &amp; Status:
                            </span>
                            {sub.notes ? (
                              <p className="text-slate-300 text-[11px] italic">
                                &quot;{sub.notes}&quot;
                              </p>
                            ) : (
                              <p className="text-slate-500 text-[11px]">No notes logged.</p>
                            )}
                            {(sub.decision === 'cancel' || sub.decision === 'pause') && (
                              <div className="pt-1 border-t border-slate-800 text-[10px] text-amber-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>Remember to {sub.decision} directly on {sub.name} to stop charges.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
