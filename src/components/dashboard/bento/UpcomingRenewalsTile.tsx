'use client';

import React from 'react';
import { Subscription, SubscriptionAnalysis } from '@/types/subscription';
import { formatCurrencyINR, formatDate } from '@/lib/calculations';
import { CalendarClock, AlertCircle, ChevronRight } from 'lucide-react';

interface UpcomingRenewalsTileProps {
  subscriptions: Subscription[];
  analyses: Map<string, SubscriptionAnalysis>;
  onOpenRenewals: () => void;
  onSelectSubscription: (sub: Subscription) => void;
}

export function UpcomingRenewalsTile({
  subscriptions,
  analyses,
  onOpenRenewals,
  onSelectSubscription,
}: UpcomingRenewalsTileProps) {
  // Sort active subscriptions chronologically by days until renewal
  const upcoming = [...subscriptions]
    .filter((s) => s.status === 'active' || s.status === 'trial')
    .sort((a, b) => {
      const da = analyses.get(a.id)?.daysUntilRenewal ?? 999;
      const db = analyses.get(b.id)?.daysUntilRenewal ?? 999;
      return da - db;
    })
    .slice(0, 4);

  return (
    <div className="bento-tile p-5 flex flex-col justify-between col-span-1 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#141A27] text-slate-300 border border-[#232B3E]">
            <CalendarClock className="w-4 h-4 text-[#C4B5FD]" />
          </div>
          <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
            Upcoming Charges
          </span>
        </div>
        <button
          onClick={onOpenRenewals}
          className="text-slate-500 hover:text-[#C4B5FD] transition-colors p-1"
          title="View all renewals"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Renewal List */}
      <div className="space-y-2 flex-1">
        {upcoming.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No upcoming renewals recorded.
          </div>
        ) : (
          upcoming.map((sub) => {
            const analysis = analyses.get(sub.id);
            const daysLeft = analysis?.daysUntilRenewal ?? 0;
            const isUrgent = daysLeft <= 7;

            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubscription(sub)}
                className="flex items-center justify-between p-2 rounded-xl bg-[#141A27]/80 hover:bg-[#182030] border border-[#1E2536] hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    {isUrgent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shrink-0" />
                    )}
                    <span className="text-xs font-medium text-slate-200 truncate block">
                      {sub.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {formatDate(sub.nextRenewalDate)}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-white font-mono block">
                    {formatCurrencyINR(sub.price)}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      daysLeft <= 3
                        ? 'text-rose-400'
                        : daysLeft <= 7
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {daysLeft === 0
                      ? 'Today'
                      : daysLeft === 1
                      ? 'Tomorrow'
                      : `in ${daysLeft}d`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-[#1B2232] mt-2 flex items-center justify-between text-[11px]">
        <span className="text-slate-400">Total upcoming:</span>
        <button
          onClick={onOpenRenewals}
          className="text-[#C4B5FD] font-medium hover:underline text-[11px]"
        >
          View Calendar Timeline &rarr;
        </button>
      </div>
    </div>
  );
}
