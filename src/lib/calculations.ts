import {
  BillingCycle,
  FinancialSummary,
  Subscription,
  SubscriptionAnalysis,
  SubscriptionCategory,
  UsageFrequency,
} from '../types/subscription';

/**
 * Normalizes any billing cycle into an accurate monthly equivalent cost in INR.
 */
export function calculateMonthlyEquivalent(
  price: number,
  billingCycle: BillingCycle,
  customDays?: number
): number {
  if (price <= 0) return 0;

  switch (billingCycle) {
    case 'weekly':
      // 52 weeks in a year / 12 months = 4.333 weeks per month
      return Math.round((price * 52) / 12);
    case 'monthly':
      return Math.round(price);
    case 'yearly':
      return Math.round(price / 12);
    case 'custom': {
      const days = customDays && customDays > 0 ? customDays : 30;
      return Math.round((price * (365 / days)) / 12);
    }
    default:
      return Math.round(price);
  }
}

/**
 * Calculates the true annual cost in INR.
 * For yearly subscriptions, uses the exact stated annual price without rounding errors.
 */
export function calculateAnnualEquivalent(
  price: number,
  billingCycle: BillingCycle,
  customDays?: number
): number {
  if (price <= 0) return 0;

  switch (billingCycle) {
    case 'weekly':
      return Math.round(price * 52);
    case 'monthly':
      return Math.round(price * 12);
    case 'yearly':
      // Prompt requirement: Use actual annual billing price for yearly subscriptions
      return Math.round(price);
    case 'custom': {
      const days = customDays && customDays > 0 ? customDays : 30;
      return Math.round(price * (365 / days));
    }
    default:
      return Math.round(price * 12);
  }
}

/**
 * Calculates days remaining until the next renewal date from today.
 */
export function getDaysUntilRenewal(renewalDateStr: string, baseDate = new Date()): number {
  if (!renewalDateStr) return 0;
  const renewal = new Date(renewalDateStr);
  if (isNaN(renewal.getTime())) return 0;

  // Zero out time components for date-only comparison
  const todayZero = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const renewalZero = new Date(renewal.getFullYear(), renewal.getMonth(), renewal.getDate());

  const diffMs = renewalZero.getTime() - todayZero.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates days passed since the service was last used.
 * Returns null if no date is recorded.
 */
export function getDaysSinceLastUsed(lastUsedDateStr?: string, baseDate = new Date()): number | null {
  if (!lastUsedDateStr) return null;
  const lastUsed = new Date(lastUsedDateStr);
  if (isNaN(lastUsed.getTime())) return null;

  const todayZero = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const lastUsedZero = new Date(lastUsed.getFullYear(), lastUsed.getMonth(), lastUsed.getDate());

  const diffMs = todayZero.getTime() - lastUsedZero.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return days >= 0 ? days : 0;
}

/**
 * Estimates monthly usage count based on self-reported frequency.
 */
export function estimateMonthlyUses(frequency: UsageFrequency): number {
  switch (frequency) {
    case 'daily':
      return 30;
    case 'weekly':
      return 4.33;
    case 'monthly':
      return 1;
    case 'rarely':
      return 0.33; // ~ once every 3 months
    case 'never':
      return 0;
    default:
      return 1;
  }
}

/**
 * Computes estimated cost per single use.
 * Returns null if frequency is 'never' or usage is 0.
 */
export function calculateEstimatedCostPerUse(
  monthlyEquivalent: number,
  frequency: UsageFrequency
): number | null {
  const uses = estimateMonthlyUses(frequency);
  if (uses <= 0) return null;
  return Math.round((monthlyEquivalent / uses) * 10) / 10;
}

/**
 * Formats numbers into INR Indian numbering format: ₹1,499
 */
export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date into a clean readable string: "28 Nov 2026"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculates aggregate financial metrics for the entire dashboard.
 */
export function calculateFinancialSummary(
  subscriptions: Subscription[],
  analyses: Map<string, SubscriptionAnalysis>
): FinancialSummary {
  let totalMonthlySpending = 0;
  let totalAnnualSpending = 0;
  let activeCount = 0;
  let trialCount = 0;
  let pausedCount = 0;
  let canceledCount = 0;
  let potentialAnnualSavings = 0;
  let decisionSavings = 0;
  let actualRealizedSavings = 0;
  let pendingCancellationsCount = 0;
  let pendingPausesCount = 0;
  let renewingSoonCount = 0;
  let requiringAttentionCount = 0;

  const riskBreakdown = {
    low: 0,
    moderate: 0,
    high: 0,
    urgent: 0,
  };

  const categorySpending: Record<SubscriptionCategory, number> = {
    Streaming: 0,
    Music: 0,
    Fitness: 0,
    'Cloud Storage': 0,
    Productivity: 0,
    Gaming: 0,
    News: 0,
    Shopping: 0,
    Education: 0,
    Other: 0,
  };

  for (const sub of subscriptions) {
    const analysis = analyses.get(sub.id);
    const monthlyCost = analysis ? analysis.monthlyEquivalent : calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customBillingDays);
    const annualCost = analysis ? analysis.annualEquivalent : calculateAnnualEquivalent(sub.price, sub.billingCycle, sub.customBillingDays);

    // Track status counts
    if (sub.status === 'active') activeCount++;
    else if (sub.status === 'trial') trialCount++;
    else if (sub.status === 'paused') pausedCount++;
    else if (sub.status === 'canceled') canceledCount++;

    // Only active and trial subscriptions contribute to current active spending
    const isPayingActive = sub.status === 'active' || sub.status === 'trial';

    if (isPayingActive) {
      totalMonthlySpending += monthlyCost;
      totalAnnualSpending += annualCost;
      categorySpending[sub.category] = (categorySpending[sub.category] || 0) + monthlyCost;

      if (analysis) {
        riskBreakdown[analysis.riskLevel]++;

        if (analysis.isRenewingSoon) {
          renewingSoonCount++;
        }

        if (analysis.riskLevel === 'high' || analysis.riskLevel === 'urgent' || analysis.recommendedAction === 'review') {
          requiringAttentionCount++;
        }

        // Potential savings from waste detection engine (likely unused, cancel or pause, urgent renewals)
        if (
          analysis.recommendedAction === 'cancel_or_pause' ||
          (analysis.recommendedAction === 'renewal_soon' && analysis.riskLevel === 'urgent')
        ) {
          potentialAnnualSavings += annualCost;
        } else if (analysis.recommendedAction === 'review') {
          potentialAnnualSavings += Math.round(annualCost * 0.5);
        } else if (analysis.recommendedAction === 'downgrade') {
          potentialAnnualSavings += Math.round(annualCost * 0.35);
        }

        // User explicit decision tracking (Planned savings from user's decision)
        if (sub.decision === 'cancel') {
          decisionSavings += annualCost;
          pendingCancellationsCount++;
        } else if (sub.decision === 'pause') {
          decisionSavings += annualCost;
          pendingPausesCount++;
        } else if (sub.decision === 'downgrade') {
          decisionSavings += Math.round(annualCost * 0.35);
        }
        // Note: 'keep' and 'review' do not add to decisionSavings
      }
    } else if (sub.status === 'canceled') {
      actualRealizedSavings += annualCost;
    }
  }

  return {
    totalMonthlySpending,
    totalAnnualSpending,
    activeCount,
    trialCount,
    pausedCount,
    canceledCount,
    potentialAnnualSavings,
    decisionSavings,
    realizedDecisionSavings: decisionSavings, // backward compatible alias
    actualRealizedSavings,
    historicalCanceledSavings: actualRealizedSavings, // backward compatible alias
    pendingCancellationsCount,
    pendingPausesCount,
    renewingSoonCount,
    requiringAttentionCount,
    riskBreakdown,
    categorySpending,
  };
}
