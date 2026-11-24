import {
  RiskLevel,
  RecommendedAction,
  Subscription,
  SubscriptionAnalysis,
} from '../types/subscription';
import {
  calculateAnnualEquivalent,
  calculateEstimatedCostPerUse,
  calculateMonthlyEquivalent,
  formatCurrencyINR,
  getDaysSinceLastUsed,
  getDaysUntilRenewal,
} from './calculations';

/**
 * Deterministic Waste Detection Engine
 * Analyzes usage patterns, upcoming renewals, and category overlap without black-box AI.
 * Every recommendation includes transparent rationale.
 */
export function analyzeSubscription(
  subscription: Subscription,
  allSubscriptions: Subscription[] = [],
  baseDate = new Date()
): SubscriptionAnalysis {
  const monthlyEquivalent = calculateMonthlyEquivalent(
    subscription.price,
    subscription.billingCycle,
    subscription.customBillingDays
  );

  const annualEquivalent = calculateAnnualEquivalent(
    subscription.price,
    subscription.billingCycle,
    subscription.customBillingDays
  );

  const daysUntilRenewal = getDaysUntilRenewal(subscription.nextRenewalDate, baseDate);
  const daysSinceLastUse = getDaysSinceLastUsed(subscription.lastUsedDate, baseDate);
  const estimatedCostPerUse = calculateEstimatedCostPerUse(
    monthlyEquivalent,
    subscription.usageFrequency
  );

  const isRenewingSoon =
    daysUntilRenewal >= 0 &&
    daysUntilRenewal <= 7 &&
    (subscription.status === 'active' || subscription.status === 'trial');

  // Detect category overlap among other active/trial subscriptions
  const overlappingServices = allSubscriptions.filter(
    (other) =>
      other.id !== subscription.id &&
      other.category === subscription.category &&
      (other.status === 'active' || other.status === 'trial')
  );

  const hasOverlapWithOther = overlappingServices.length > 0;
  const overlappingServiceNames = overlappingServices.map((s) => s.name);

  // Status overrides: paused or canceled don't generate waste alarms
  if (subscription.status === 'paused') {
    return {
      subscriptionId: subscription.id,
      monthlyEquivalent,
      annualEquivalent,
      daysUntilRenewal,
      daysSinceLastUse,
      estimatedCostPerUse,
      riskLevel: 'low',
      recommendedAction: 'keep',
      recommendationTitle: 'Subscription Paused',
      recommendationReason: 'Billing is currently halted. You are not incurring active charges.',
      potentialYearlySavings: 0,
      isRenewingSoon: false,
      hasOverlapWithOther,
      overlappingServiceNames,
    };
  }

  if (subscription.status === 'canceled') {
    return {
      subscriptionId: subscription.id,
      monthlyEquivalent,
      annualEquivalent,
      daysUntilRenewal,
      daysSinceLastUse,
      estimatedCostPerUse,
      riskLevel: 'low',
      recommendedAction: 'keep',
      recommendationTitle: 'Subscription Canceled',
      recommendationReason: `Successfully canceled. You have stopped an annual expenditure of ${formatCurrencyINR(annualEquivalent)}.`,
      potentialYearlySavings: 0,
      isRenewingSoon: false,
      hasOverlapWithOther: false,
      overlappingServiceNames: [],
    };
  }

  // --- RULE 1: Urgent renewal with prolonged inactivity ---
  // Renews in <= 7 days AND (inactive > 60 days OR marked 'never')
  const isInactiveLongTerm =
    (daysSinceLastUse !== null && daysSinceLastUse > 60) ||
    subscription.usageFrequency === 'never';

  if (isRenewingSoon && isInactiveLongTerm) {
    const daysStr = daysUntilRenewal === 0 ? 'today' : daysUntilRenewal === 1 ? 'tomorrow' : `in ${daysUntilRenewal} days`;
    const inactivityStr =
      subscription.usageFrequency === 'never'
        ? 'marked as never used'
        : `no recorded usage for ${daysSinceLastUse} days`;

    return {
      subscriptionId: subscription.id,
      monthlyEquivalent,
      annualEquivalent,
      daysUntilRenewal,
      daysSinceLastUse,
      estimatedCostPerUse,
      riskLevel: 'urgent',
      recommendedAction: 'renewal_soon',
      recommendationTitle: 'Urgent: Renewing Soon & Inactive',
      recommendationReason: `Renews ${daysStr} (${formatCurrencyINR(subscription.price)}) with ${inactivityStr}. Act before renewal to prevent waste.`,
      potentialYearlySavings: annualEquivalent,
      isRenewingSoon: true,
      hasOverlapWithOther,
      overlappingServiceNames,
    };
  }

  // --- RULE 2: Likely unused subscriptions (Inactivity > 60 days or Frequency 'never') ---
  if (isInactiveLongTerm) {
    const reasonDetail =
      subscription.usageFrequency === 'never'
        ? 'Subscription is flagged as never used'
        : `Last recorded use was ${daysSinceLastUse} days ago (> 60 days)`;

    let overlapNote = '';
    if (hasOverlapWithOther) {
      overlapNote = ` Also note: you have another active ${subscription.category} subscription (${overlappingServiceNames.join(', ')}).`;
    }

    return {
      subscriptionId: subscription.id,
      monthlyEquivalent,
      annualEquivalent,
      daysUntilRenewal,
      daysSinceLastUse,
      estimatedCostPerUse,
      riskLevel: 'high',
      recommendedAction: 'cancel_or_pause',
      recommendationTitle: 'Likely Unused Subscription',
      recommendationReason: `${reasonDetail}. Canceling or pausing will recover ${formatCurrencyINR(annualEquivalent)} annually.${overlapNote}`,
      potentialYearlySavings: annualEquivalent,
      isRenewingSoon,
      hasOverlapWithOther,
      overlappingServiceNames,
    };
  }

  // --- RULE 3: Underutilized / Review (Inactivity 31–60 days) ---
  if (daysSinceLastUse !== null && daysSinceLastUse >= 31 && daysSinceLastUse <= 60) {
    let overlapNote = '';
    if (hasOverlapWithOther) {
      overlapNote = ` You also have ${overlappingServiceNames.join(', ')} in the same category.`;
    }

    return {
      subscriptionId: subscription.id,
      monthlyEquivalent,
      annualEquivalent,
      daysUntilRenewal,
      daysSinceLastUse,
      estimatedCostPerUse,
      riskLevel: 'moderate',
      recommendedAction: 'review',
      recommendationTitle: 'Underutilized — Review Needed',
      recommendationReason: `Last used ${daysSinceLastUse} days ago. Consider whether this still fits your routine before the next cycle.${overlapNote}`,
      potentialYearlySavings: Math.round(annualEquivalent * 0.5),
      isRenewingSoon,
      hasOverlapWithOther,
      overlappingServiceNames,
    };
  }

  // --- RULE 4: Missing last-used date (Never assume automatically unused) ---
  if (daysSinceLastUse === null) {
    if (subscription.usageFrequency === 'rarely') {
      return {
        subscriptionId: subscription.id,
        monthlyEquivalent,
        annualEquivalent,
        daysUntilRenewal,
        daysSinceLastUse: null,
        estimatedCostPerUse,
        riskLevel: 'moderate',
        recommendedAction: 'review',
        recommendationTitle: 'Infrequent Use — Missing Date',
        recommendationReason: 'Marked as rarely used with no last-used date logged. Consider downgrading or logging usage.',
        potentialYearlySavings: Math.round(annualEquivalent * 0.35),
        isRenewingSoon,
        hasOverlapWithOther,
        overlappingServiceNames,
      };
    }

    // Daily, weekly, or monthly with missing date
    return {
      subscriptionId: subscription.id,
      monthlyEquivalent,
      annualEquivalent,
      daysUntilRenewal,
      daysSinceLastUse: null,
      estimatedCostPerUse,
      riskLevel: 'low',
      recommendedAction: 'keep',
      recommendationTitle: 'Active Self-Reported Usage',
      recommendationReason: `Reported as ${subscription.usageFrequency} use. Adding exact dates helps improve waste detection accuracy.`,
      potentialYearlySavings: 0,
      isRenewingSoon,
      hasOverlapWithOther,
      overlappingServiceNames,
    };
  }

  // --- RULE 5: Moderately Active (Used within 8–30 days) ---
  if (daysSinceLastUse >= 8 && daysSinceLastUse <= 30) {
    let overlapNote = '';
    if (hasOverlapWithOther) {
      overlapNote = ` Note: You also have ${overlappingServiceNames.join(', ')} in ${subscription.category}.`;
    }

    return {
      subscriptionId: subscription.id,
      monthlyEquivalent,
      annualEquivalent,
      daysUntilRenewal,
      daysSinceLastUse,
      estimatedCostPerUse,
      riskLevel: 'low',
      recommendedAction: 'keep',
      recommendationTitle: 'Regularly Used',
      recommendationReason: `Used ${daysSinceLastUse} days ago. Steady recurring utility justifies maintaining this service.${overlapNote}`,
      potentialYearlySavings: 0,
      isRenewingSoon,
      hasOverlapWithOther,
      overlappingServiceNames,
    };
  }

  // --- RULE 6: Frequently Active (Used within last 7 days) ---
  const daysStr = daysSinceLastUse === 0 ? 'today' : daysSinceLastUse === 1 ? 'yesterday' : `${daysSinceLastUse} days ago`;
  let overlapNote = '';
  if (hasOverlapWithOther) {
    overlapNote = ` Service overlap with ${overlappingServiceNames.join(', ')} — check if both are necessary.`;
  }

  return {
    subscriptionId: subscription.id,
    monthlyEquivalent,
    annualEquivalent,
    daysUntilRenewal,
    daysSinceLastUse,
    estimatedCostPerUse,
    riskLevel: 'low',
    recommendedAction: 'keep',
    recommendationTitle: 'Actively Used & High Value',
    recommendationReason: `Used ${daysStr}. High engagement delivers strong return on your spend.${overlapNote}`,
    potentialYearlySavings: 0,
    isRenewingSoon,
    hasOverlapWithOther,
    overlappingServiceNames,
  };
}

/**
 * Analyzes an entire array of subscriptions and returns a lookup Map.
 */
export function analyzeAllSubscriptions(
  subscriptions: Subscription[],
  baseDate = new Date()
): Map<string, SubscriptionAnalysis> {
  const map = new Map<string, SubscriptionAnalysis>();

  for (const sub of subscriptions) {
    const analysis = analyzeSubscription(sub, subscriptions, baseDate);
    map.set(sub.id, analysis);
  }

  return map;
}
