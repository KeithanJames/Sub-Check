'use client';

import React from 'react';
import {
  Subscription,
  SubscriptionAnalysis,
  FinancialSummary,
  ActivityLog,
  SubscriptionCategory,
} from '@/types/subscription';
import { HeroFinancialTile } from './HeroFinancialTile';
import { SubscriptionStackTile } from './SubscriptionStackTile';
import { UpcomingRenewalsTile } from './UpcomingRenewalsTile';
import { SpendingAllocationTile } from './SpendingAllocationTile';
import { WasteDetectionTile } from './WasteDetectionTile';
import { RecentActivityTile } from './RecentActivityTile';

interface BentoDashboardProps {
  summary: FinancialSummary;
  subscriptions: Subscription[];
  attentionSubscriptions: Subscription[];
  analyses: Map<string, SubscriptionAnalysis>;
  activities: ActivityLog[];
  onOpenWasteTab: () => void;
  onOpenSubscriptions: () => void;
  onOpenRenewals: () => void;
  onSelectSubscription: (sub: Subscription) => void;
  onSelectCategory: (cat: SubscriptionCategory) => void;
}

export function BentoDashboard({
  summary,
  subscriptions,
  attentionSubscriptions,
  analyses,
  activities,
  onOpenWasteTab,
  onOpenSubscriptions,
  onOpenRenewals,
  onSelectSubscription,
  onSelectCategory,
}: BentoDashboardProps) {
  return (
    <div className="space-y-4">
      {/* 4-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ROW 1 */}
        {/* Tile A: Hero Financial Overview (2 columns) */}
        <HeroFinancialTile
          summary={summary}
          subscriptions={subscriptions}
          onOpenWasteTab={onOpenWasteTab}
        />

        {/* Tile E: Waste Detection Differentiator (1 column) */}
        <WasteDetectionTile
          summary={summary}
          attentionSubscriptions={attentionSubscriptions}
          analyses={analyses}
          onOpenWasteTab={onOpenWasteTab}
        />

        {/* Tile B: Subscription Stack Health (1 column) */}
        <SubscriptionStackTile
          summary={summary}
          subscriptions={subscriptions}
          onOpenSubscriptions={onOpenSubscriptions}
        />

        {/* ROW 2 */}
        {/* Tile D: Spending Allocation by Category (2 columns) */}
        <SpendingAllocationTile
          summary={summary}
          onSelectCategory={onSelectCategory}
        />

        {/* Tile C: Upcoming Renewals (1 column) */}
        <UpcomingRenewalsTile
          subscriptions={subscriptions}
          analyses={analyses}
          onOpenRenewals={onOpenRenewals}
          onSelectSubscription={onSelectSubscription}
        />

        {/* Tile F: Recent Activity Audit (1 column) */}
        <RecentActivityTile activities={activities} />
      </div>
    </div>
  );
}
