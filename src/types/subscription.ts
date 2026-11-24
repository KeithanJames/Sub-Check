export type SubscriptionCategory =
  | 'Streaming'
  | 'Music'
  | 'Fitness'
  | 'Cloud Storage'
  | 'Productivity'
  | 'Gaming'
  | 'News'
  | 'Shopping'
  | 'Education'
  | 'Other';

export type BillingCycle = 'weekly' | 'monthly' | 'yearly' | 'custom';

export type SubscriptionStatus = 'active' | 'trial' | 'paused' | 'canceled';

export type UsageFrequency = 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';

export type UserDecision = 'keep' | 'review' | 'cancel' | 'pause' | 'downgrade';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'urgent';

export type RecommendedAction =
  | 'keep'
  | 'review'
  | 'cancel_or_pause'
  | 'downgrade'
  | 'renewal_soon';

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  customBillingDays?: number;
  nextRenewalDate: string; // YYYY-MM-DD
  lastUsedDate?: string; // YYYY-MM-DD
  usageFrequency: UsageFrequency;
  status: SubscriptionStatus;
  decision: UserDecision;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionAnalysis {
  subscriptionId: string;
  monthlyEquivalent: number;
  annualEquivalent: number;
  daysUntilRenewal: number;
  daysSinceLastUse: number | null;
  estimatedCostPerUse: number | null;
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
  recommendationTitle: string;
  recommendationReason: string;
  potentialYearlySavings: number;
  isRenewingSoon: boolean; // within 7 days
  hasOverlapWithOther: boolean;
  overlappingServiceNames: string[];
}

export interface FinancialSummary {
  totalMonthlySpending: number;
  totalAnnualSpending: number;
  activeCount: number;
  trialCount: number;
  pausedCount: number;
  canceledCount: number;
  potentialAnnualSavings: number; // Potential waste identified by algorithm
  decisionSavings: number; // Planned savings from user's active decisions (cancel/pause/downgrade)
  realizedDecisionSavings: number; // Alias for decisionSavings (backward compatibility)
  actualRealizedSavings: number; // Subscriptions actually canceled with provider
  historicalCanceledSavings: number; // Alias for actualRealizedSavings (backward compatibility)
  pendingCancellationsCount: number;
  pendingPausesCount: number;
  renewingSoonCount: number;
  requiringAttentionCount: number;
  riskBreakdown: {
    low: number;
    moderate: number;
    high: number;
    urgent: number;
  };
  categorySpending: Record<SubscriptionCategory, number>; // monthly equivalent
}

export type FilterType =
  | 'all'
  | 'active'
  | 'trial'
  | 'likely_unused'
  | 'review'
  | 'renewing_soon';

export interface ActivityLog {
  id: string;
  type: 'decision' | 'status' | 'add' | 'edit' | 'delete' | 'reset';
  title: string;
  description: string;
  timestamp: string;
}
