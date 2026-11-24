'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Subscription,
  SubscriptionCategory,
  BillingCycle,
  SubscriptionStatus,
  UsageFrequency,
  UserDecision,
} from '@/types/subscription';
import { Modal } from '../ui/Modal';
import {
  calculateMonthlyEquivalent,
  calculateAnnualEquivalent,
  formatCurrencyINR,
} from '@/lib/calculations';
import { analyzeSubscription } from '@/lib/recommendations';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface SubscriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialSubscription?: Subscription | null;
  existingSubscriptions?: Subscription[];
}

const CATEGORIES: SubscriptionCategory[] = [
  'Streaming',
  'Music',
  'Fitness',
  'Cloud Storage',
  'Productivity',
  'Gaming',
  'News',
  'Shopping',
  'Education',
  'Other',
];

const BILLING_CYCLES: { id: BillingCycle; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'custom', label: 'Custom Interval' },
];

const USAGE_FREQUENCIES: { id: UsageFrequency; label: string }[] = [
  { id: 'daily', label: 'Daily (High value)' },
  { id: 'weekly', label: 'Weekly (Regular)' },
  { id: 'monthly', label: 'Monthly (Occasional)' },
  { id: 'rarely', label: 'Rarely (Review suggested)' },
  { id: 'never', label: 'Never (Likely waste)' },
];

export function SubscriptionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialSubscription,
  existingSubscriptions = [],
}: SubscriptionFormModalProps) {
  // Today formatted as YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SubscriptionCategory>('Streaming');
  const [price, setPrice] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [customBillingDays, setCustomBillingDays] = useState<string>('30');
  const [nextRenewalDate, setNextRenewalDate] = useState<string>('');
  const [lastUsedDate, setLastUsedDate] = useState<string>('');
  const [usageFrequency, setUsageFrequency] = useState<UsageFrequency>('daily');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [decision, setDecision] = useState<UserDecision>('keep');
  const [notes, setNotes] = useState<string>('');

  // Validation Error State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form if editing
  useEffect(() => {
    if (initialSubscription) {
      setName(initialSubscription.name);
      setCategory(initialSubscription.category);
      setPrice(String(initialSubscription.price));
      setBillingCycle(initialSubscription.billingCycle);
      setCustomBillingDays(
        initialSubscription.customBillingDays ? String(initialSubscription.customBillingDays) : '30'
      );
      setNextRenewalDate(initialSubscription.nextRenewalDate);
      setLastUsedDate(initialSubscription.lastUsedDate || '');
      setUsageFrequency(initialSubscription.usageFrequency);
      setStatus(initialSubscription.status);
      setDecision(initialSubscription.decision);
      setNotes(initialSubscription.notes || '');
    } else {
      // Default new subscription values
      setName('');
      setCategory('Streaming');
      setPrice('');
      setBillingCycle('monthly');
      setCustomBillingDays('30');
      // Default renewal date to 30 days from now
      const defaultRenewal = new Date();
      defaultRenewal.setDate(defaultRenewal.getDate() + 30);
      setNextRenewalDate(defaultRenewal.toISOString().split('T')[0]);
      setLastUsedDate(todayStr);
      setUsageFrequency('daily');
      setStatus('active');
      setDecision('keep');
      setNotes('');
    }
    setErrors({});
  }, [initialSubscription, isOpen, todayStr]);

  // Real-time calculation preview
  const numPrice = parseFloat(price) || 0;
  const numDays = parseInt(customBillingDays) || 30;

  const monthlyCalc = calculateMonthlyEquivalent(numPrice, billingCycle, numDays);
  const annualCalc = calculateAnnualEquivalent(numPrice, billingCycle, numDays);

  // Live Waste Engine Preview
  const liveAnalysis = useMemo(() => {
    const tempSub: Subscription = {
      id: initialSubscription?.id || 'temp',
      name: name || 'Preview Service',
      category,
      price: numPrice,
      currency: 'INR',
      billingCycle,
      customBillingDays: numDays,
      nextRenewalDate: nextRenewalDate || todayStr,
      lastUsedDate: lastUsedDate || undefined,
      usageFrequency,
      status,
      decision,
      createdAt: todayStr,
      updatedAt: todayStr,
    };
    return analyzeSubscription(tempSub, existingSubscriptions);
  }, [
    initialSubscription?.id,
    name,
    category,
    numPrice,
    billingCycle,
    numDays,
    nextRenewalDate,
    lastUsedDate,
    usageFrequency,
    status,
    decision,
    todayStr,
    existingSubscriptions,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Service name is required';
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Please enter a valid price greater than 0';
    }
    if (!nextRenewalDate) {
      newErrors.nextRenewalDate = 'Next renewal date is required';
    }
    if (billingCycle === 'custom' && (!customBillingDays || Number(customBillingDays) <= 0)) {
      newErrors.customBillingDays = 'Custom days must be at least 1';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      category,
      price: Math.round(Number(price) * 100) / 100,
      currency: 'INR',
      billingCycle,
      customBillingDays: billingCycle === 'custom' ? Number(customBillingDays) : undefined,
      nextRenewalDate,
      lastUsedDate: lastUsedDate.trim() ? lastUsedDate : undefined,
      usageFrequency,
      status,
      decision,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSubscription ? 'Edit Subscription' : 'Add New Subscription'}
      description="Record recurring service details, renewal schedule, and usage patterns."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Row 1: Service Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Service Name <span className="text-[#D4F940]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Netflix, Spotify, Gym, GitHub"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#D4F940] transition-colors"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Category <span className="text-[#D4F940]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SubscriptionCategory)}
              className="w-full px-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 focus:outline-none focus:border-[#D4F940] transition-colors cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Price & Billing Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-slate-300 font-medium mb-1">
              Price (INR ₹) <span className="text-[#D4F940]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-medium">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="499"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#D4F940] transition-colors font-mono"
              />
            </div>
            {errors.price && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.price}
              </p>
            )}
          </div>

          <div className="sm:col-span-1">
            <label className="block text-slate-300 font-medium mb-1">Billing Cycle</label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
              className="w-full px-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 focus:outline-none focus:border-[#D4F940] transition-colors cursor-pointer"
            >
              {BILLING_CYCLES.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>
                  {cycle.label}
                </option>
              ))}
            </select>
          </div>

          {billingCycle === 'custom' && (
            <div className="sm:col-span-1">
              <label className="block text-slate-300 font-medium mb-1">Custom Days</label>
              <input
                type="number"
                min="1"
                placeholder="45"
                value={customBillingDays}
                onChange={(e) => setCustomBillingDays(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 font-mono"
              />
            </div>
          )}

          {billingCycle !== 'custom' && (
            <div className="sm:col-span-1 flex flex-col justify-end">
              <div className="p-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-[11px] text-slate-400">
                Monthly: <span className="font-mono text-white">{formatCurrencyINR(monthlyCalc)}</span>
                <br />
                Annual: <span className="font-mono text-white">{formatCurrencyINR(annualCalc)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Next Renewal & Last Used Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Next Renewal Date <span className="text-[#D4F940]">*</span>
            </label>
            <input
              type="date"
              value={nextRenewalDate}
              onChange={(e) => setNextRenewalDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 focus:outline-none focus:border-[#D4F940] transition-colors cursor-pointer"
            />
            {errors.nextRenewalDate && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.nextRenewalDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Last Used Date <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={lastUsedDate}
              onChange={(e) => setLastUsedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 focus:outline-none focus:border-[#D4F940] transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Row 4: Usage Frequency, Status, Decision */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Usage Frequency</label>
            <select
              value={usageFrequency}
              onChange={(e) => setUsageFrequency(e.target.value as UsageFrequency)}
              className="w-full px-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 focus:outline-none focus:border-[#D4F940] transition-colors cursor-pointer"
            >
              {USAGE_FREQUENCIES.map((freq) => (
                <option key={freq.id} value={freq.id}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Subscription Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
              className="w-full px-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 focus:outline-none focus:border-[#D4F940] transition-colors cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="paused">Paused</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Your Decision</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as UserDecision)}
              className="w-full px-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 focus:outline-none focus:border-[#D4F940] transition-colors cursor-pointer"
            >
              <option value="keep">Keep</option>
              <option value="review">Review</option>
              <option value="pause">Pause</option>
              <option value="cancel">Cancel</option>
              <option value="downgrade">Downgrade</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Notes / Cancellation Thoughts <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Subscribed for college project, may cancel after semester exams."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#08090C] border border-[#1B2232] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#D4F940] transition-colors"
          />
        </div>

        {/* Live Engine Diagnostic Preview */}
        {numPrice > 0 && (
          <div className="p-3 rounded-xl bg-[#141B2A] border border-[#D4F940]/25 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-[#D4F940] font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                Waste Engine Live Projection:
              </span>
              <Badge variant="risk" riskLevel={liveAnalysis.riskLevel} size="sm">
                {liveAnalysis.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
            <p className="text-[11px] text-slate-300">{liveAnalysis.recommendationReason}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1B2232]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-medium text-slate-300 bg-[#161C29] hover:bg-[#1C2436] border border-[#1B2232] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl font-semibold text-black bg-[#D4F940] hover:bg-[#C4EB2E] border border-[#D4F940] shadow-md shadow-[#D4F940]/15 transition-all hover:scale-[1.01]"
          >
            {initialSubscription ? 'Save Changes' : 'Add Subscription'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
