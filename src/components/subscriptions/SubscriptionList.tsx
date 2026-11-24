'use client';

import React from 'react';
import {
  Subscription,
  SubscriptionAnalysis,
  UserDecision,
  SubscriptionStatus,
} from '@/types/subscription';
import { SubscriptionCard } from './SubscriptionCard';
import { Plus, SearchX, CreditCard } from 'lucide-react';

interface SubscriptionListProps {
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

export function SubscriptionList({
  subscriptions,
  filteredSubscriptions,
  analyses,
  onEdit,
  onDelete,
  onUpdateDecision,
  onUpdateStatus,
  onOpenAddModal,
  onResetFilters,
}: SubscriptionListProps) {
  // Empty state 1: Total empty (no subscriptions entered at all)
  if (subscriptions.length === 0) {
    return (
      <div className="bento-tile p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#141B2A] text-[#D4F940] border border-[#D4F940]/30 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white font-mono">No subscriptions tracked yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
          Start recording your recurring services to monitor upcoming renewals, get usage insights, and calculate potential savings.
        </p>
        <button
          onClick={onOpenAddModal}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-black bg-[#D4F940] hover:bg-[#C4EB2E] border border-[#D4F940] shadow-md shadow-[#D4F940]/15 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add First Subscription</span>
        </button>
      </div>
    );
  }

  // Empty state 2: Filter resulted in 0 items
  if (filteredSubscriptions.length === 0) {
    return (
      <div className="bento-tile p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#141B2A] text-slate-400 border border-[#1B2232] flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white font-mono">No matching subscriptions found</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          We couldn&apos;t find any subscriptions matching your current search or category filters.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-[#161C29] hover:bg-[#1E273A] border border-[#1B2232] transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredSubscriptions.map((sub) => (
        <SubscriptionCard
          key={sub.id}
          subscription={sub}
          analysis={analyses.get(sub.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateDecision={onUpdateDecision}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}
