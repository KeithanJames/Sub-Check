'use client';

import React from 'react';
import { Subscription, SubscriptionAnalysis } from '@/types/subscription';
import { formatCurrencyINR, formatDate } from '@/lib/calculations';
import { CalendarClock, AlertTriangle, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface RenewalWarningsProps {
  renewingSubscriptions: Subscription[];
  analyses: Map<string, SubscriptionAnalysis>;
  onSelectSubscription: (sub: Subscription) => void;
  onFilterRenewingSoon: () => void;
}

export function RenewalWarnings({
  renewingSubscriptions,
  analyses,
  onSelectSubscription,
  onFilterRenewingSoon,
}: RenewalWarningsProps) {
  if (renewingSubscriptions.length === 0) {
    return null;
  }

  return (
    <div className="bento-tile p-4 sm:p-5 border-amber-900/40 relative overflow-hidden bg-gradient-to-r from-amber-950/15 via-[#0E131E] to-[#0E131E]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-950/70 text-amber-300 border border-amber-800/50">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-200">
              Upcoming Renewals Within 7 Days
            </h3>
            <p className="text-xs text-amber-300/80">
              {renewingSubscriptions.length} {renewingSubscriptions.length === 1 ? 'subscription is' : 'subscriptions are'} scheduled to charge your account soon.
            </p>
          </div>
        </div>

        <button
          onClick={onFilterRenewingSoon}
          className="self-start sm:self-center inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
        >
          <span>View all upcoming</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {renewingSubscriptions.map((sub) => {
          const analysis = analyses.get(sub.id);
          const daysLeft = analysis?.daysUntilRenewal ?? 0;
          const isUrgent = analysis?.riskLevel === 'urgent';

          return (
            <div
              key={sub.id}
              onClick={() => onSelectSubscription(sub)}
              className="p-3.5 rounded-xl bg-[#08090C] border border-[#1B2232] hover:border-amber-700/60 cursor-pointer transition-all hover:bg-[#101420] group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-xs text-white group-hover:text-amber-300 transition-colors">
                    {sub.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {sub.category} • {formatCurrencyINR(sub.price)}/{sub.billingCycle}
                  </div>
                </div>

                <Badge
                  variant={isUrgent ? 'risk' : 'default'}
                  riskLevel={isUrgent ? 'urgent' : undefined}
                  size="sm"
                >
                  {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d left`}
                </Badge>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1B2232] flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Renews: {formatDate(sub.nextRenewalDate)}</span>
                {isUrgent ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400">
                    <AlertTriangle className="w-3 h-3" />
                    No recent usage!
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px]">
                    Decision: <span className="capitalize text-slate-300">{sub.decision}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
