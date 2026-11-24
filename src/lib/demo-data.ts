import { Subscription } from '../types/subscription';

/**
 * Helper to compute an ISO date string (YYYY-MM-DD) offset by +/- days from today.
 */
function getDateOffset(daysOffset: number, base = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates dynamic, realistic demo data relative to the current day.
 * Ensures renewal warnings (< 7 days) and inactivity alerts (> 60 days) trigger reliably anytime.
 */
export function generateDemoSubscriptions(): Subscription[] {
  const now = new Date().toISOString();

  return [
    {
      id: 'sub-netflix',
      name: 'Netflix Premium',
      category: 'Streaming',
      price: 649,
      currency: 'INR',
      billingCycle: 'monthly',
      nextRenewalDate: getDateOffset(4), // Renews in 4 days (Urgent warning!)
      lastUsedDate: getDateOffset(-75), // No use for 75 days (> 60 days inactive)
      usageFrequency: 'never',
      status: 'active',
      decision: 'cancel',
      notes: 'Subscribed for stranger things, haven’t opened app in over 2 months.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sub-xbox',
      name: 'Xbox Game Pass Ultimate',
      category: 'Gaming',
      price: 349,
      currency: 'INR',
      billingCycle: 'monthly',
      nextRenewalDate: getDateOffset(2), // Renews in 2 days (Urgent warning!)
      lastUsedDate: getDateOffset(-68), // No use for 68 days (> 60 days inactive)
      usageFrequency: 'rarely',
      status: 'active',
      decision: 'pause',
      notes: 'College exams started, zero time to play PC or console games.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sub-canva',
      name: 'Canva Pro',
      category: 'Productivity',
      price: 500,
      currency: 'INR',
      billingCycle: 'monthly',
      nextRenewalDate: getDateOffset(6), // Renews in 6 days (Review needed)
      lastUsedDate: getDateOffset(-42), // Last used 42 days ago (31–60 days moderate risk)
      usageFrequency: 'rarely',
      status: 'active',
      decision: 'downgrade',
      notes: 'Bought for resume and college presentation design.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sub-spotify',
      name: 'Spotify Premium Individual',
      category: 'Music',
      price: 119,
      currency: 'INR',
      billingCycle: 'monthly',
      nextRenewalDate: getDateOffset(18), // Renews in 18 days
      lastUsedDate: getDateOffset(0), // Used today
      usageFrequency: 'daily',
      status: 'active',
      decision: 'keep',
      notes: 'Daily coding soundtrack and workout playlist.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sub-youtube',
      name: 'YouTube Premium',
      category: 'Streaming',
      price: 149,
      currency: 'INR',
      billingCycle: 'monthly',
      nextRenewalDate: getDateOffset(22), // Renews in 22 days
      lastUsedDate: getDateOffset(-1), // Used yesterday
      usageFrequency: 'daily',
      status: 'active',
      decision: 'keep',
      notes: 'Ad-free tech tutorials and background playback.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sub-amazon',
      name: 'Amazon Prime',
      category: 'Shopping',
      price: 1499,
      currency: 'INR',
      billingCycle: 'yearly',
      nextRenewalDate: getDateOffset(115), // Renews in ~4 months
      lastUsedDate: getDateOffset(-3), // Used 3 days ago
      usageFrequency: 'weekly',
      status: 'active',
      decision: 'keep',
      notes: 'Free fast delivery and occasional Prime Video movies.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sub-google-one',
      name: 'Google One (100 GB)',
      category: 'Cloud Storage',
      price: 1300,
      currency: 'INR',
      billingCycle: 'yearly',
      nextRenewalDate: getDateOffset(240), // Renews in 8 months
      lastUsedDate: getDateOffset(0), // Used today (Drive sync)
      usageFrequency: 'daily',
      status: 'active',
      decision: 'keep',
      notes: 'Storage for Gmail, Google Photos, and project backups.',
      createdAt: now,
      updatedAt: now,
    },
  ];
}
