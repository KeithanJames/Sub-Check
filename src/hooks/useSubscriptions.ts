'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Subscription,
  SubscriptionAnalysis,
  FinancialSummary,
  FilterType,
  SubscriptionCategory,
  UserDecision,
  SubscriptionStatus,
} from '@/types/subscription';
import {
  getSavedSubscriptions,
  saveSubscriptions,
  getSavedActivities,
  saveActivities,
  resetToDemoData,
  exportSubscriptionsAsJSON,
  validateAndImportSubscriptions,
} from '@/lib/storage';
import { analyzeAllSubscriptions } from '@/lib/recommendations';
import { calculateFinancialSummary } from '@/lib/calculations';
import { ActivityLog } from '@/types/subscription';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<SubscriptionCategory | 'all'>('all');

  // Hydrate from localStorage once mounted on client to prevent SSR hydration mismatch
  useEffect(() => {
    const loaded = getSavedSubscriptions();
    const loadedActivities = getSavedActivities();
    setSubscriptions(loaded);
    setActivities(loadedActivities);
    setIsLoaded(true);
  }, []);

  // Sync to localStorage whenever subscriptions change (only after initial hydration)
  const persistSubscriptions = useCallback((newSubs: Subscription[]) => {
    setSubscriptions(newSubs);
    saveSubscriptions(newSubs);
  }, []);

  const addActivity = useCallback((entry: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...entry,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => {
      const updated = [newActivity, ...prev].slice(0, 30);
      saveActivities(updated);
      return updated;
    });
  }, []);

  // Compute deterministic analyses for all subscriptions via pure engine
  const analyses = useMemo(() => {
    return analyzeAllSubscriptions(subscriptions);
  }, [subscriptions]);

  // Aggregate financial metrics
  const financialSummary: FinancialSummary = useMemo(() => {
    return calculateFinancialSummary(subscriptions, analyses);
  }, [subscriptions, analyses]);

  // Subscriptions requiring immediate user attention (high/urgent risk or renewing soon inactive)
  const attentionSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const analysis = analyses.get(sub.id);
      if (!analysis) return false;
      const isPaying = sub.status === 'active' || sub.status === 'trial';
      return (
        isPaying &&
        (analysis.riskLevel === 'urgent' ||
          analysis.riskLevel === 'high' ||
          analysis.recommendedAction === 'review' ||
          analysis.isRenewingSoon)
      );
    });
  }, [subscriptions, analyses]);

  // Subscriptions renewing within next 7 days
  const renewingSoonSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const analysis = analyses.get(sub.id);
      return analysis?.isRenewingSoon ?? false;
    });
  }, [subscriptions, analyses]);

  // Filtered and searched list
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const analysis = analyses.get(sub.id);

      // Search matching (Name, Category, Notes)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = sub.name.toLowerCase().includes(query);
        const matchesCat = sub.category.toLowerCase().includes(query);
        const matchesNotes = sub.notes?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesCat && !matchesNotes) {
          return false;
        }
      }

      // Category matching
      if (selectedCategory !== 'all' && sub.category !== selectedCategory) {
        return false;
      }

      // Filter tabs matching
      switch (selectedFilter) {
        case 'active':
          return sub.status === 'active';
        case 'trial':
          return sub.status === 'trial';
        case 'likely_unused':
          return (
            analysis?.riskLevel === 'high' ||
            analysis?.recommendedAction === 'cancel_or_pause'
          );
        case 'review':
          return (
            analysis?.recommendedAction === 'review' ||
            analysis?.riskLevel === 'moderate'
          );
        case 'renewing_soon':
          return analysis?.isRenewingSoon ?? false;
        case 'all':
        default:
          return true;
      }
    });
  }, [subscriptions, analyses, searchQuery, selectedFilter, selectedCategory]);

  // CRUD: Add
  const addSubscription = useCallback(
    (newSubData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newSubscription: Subscription = {
        ...newSubData,
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };

      const updated = [newSubscription, ...subscriptions];
      persistSubscriptions(updated);
      addActivity({
        type: 'add',
        title: 'Subscription Added',
        description: `Added ${newSubData.name} (₹${newSubData.price}/${newSubData.billingCycle})`,
      });
      return newSubscription;
    },
    [subscriptions, persistSubscriptions, addActivity]
  );

  // CRUD: Update
  const updateSubscription = useCallback(
    (id: string, updates: Partial<Omit<Subscription, 'id' | 'createdAt'>>) => {
      const now = new Date().toISOString();
      let targetName = 'Subscription';
      const updated = subscriptions.map((sub) => {
        if (sub.id === id) {
          targetName = sub.name;
          return { ...sub, ...updates, updatedAt: now };
        }
        return sub;
      });
      persistSubscriptions(updated);
      if (!updates.decision && !updates.status) {
        addActivity({
          type: 'edit',
          title: 'Subscription Updated',
          description: `Updated metadata for ${targetName}`,
        });
      }
    },
    [subscriptions, persistSubscriptions, addActivity]
  );

  // CRUD: Delete
  const deleteSubscription = useCallback(
    (id: string) => {
      const target = subscriptions.find((s) => s.id === id);
      const updated = subscriptions.filter((sub) => sub.id !== id);
      persistSubscriptions(updated);
      addActivity({
        type: 'delete',
        title: 'Subscription Deleted',
        description: `Removed ${target?.name || 'subscription'}`,
      });
    },
    [subscriptions, persistSubscriptions, addActivity]
  );

  // Quick Action: Update User Decision
  const updateDecision = useCallback(
    (id: string, decision: UserDecision) => {
      const target = subscriptions.find((s) => s.id === id);
      updateSubscription(id, { decision });
      addActivity({
        type: 'decision',
        title: 'Decision Logged',
        description: `${target?.name || 'Service'}: marked as ${decision.toUpperCase()}`,
      });
    },
    [subscriptions, updateSubscription, addActivity]
  );

  // Quick Action: Update Status
  const updateStatus = useCallback(
    (id: string, status: SubscriptionStatus) => {
      const target = subscriptions.find((s) => s.id === id);
      updateSubscription(id, { status });
      addActivity({
        type: 'status',
        title: 'Status Updated',
        description: `${target?.name || 'Service'} provider status set to ${status.toUpperCase()}`,
      });
    },
    [subscriptions, updateSubscription, addActivity]
  );

  // Demo Reset (option to preserve user created subscriptions)
  const resetDemo = useCallback(
    (preserveCustomSubs = false) => {
      if (preserveCustomSubs) {
        const customSubs = subscriptions.filter(
          (s) => !s.id.startsWith('sub-') && !['sub-netflix', 'sub-xbox', 'sub-canva', 'sub-spotify', 'sub-youtube', 'sub-amazon', 'sub-google-one'].includes(s.id)
        );
        const demoData = resetToDemoData();
        const merged = [...demoData, ...customSubs];
        persistSubscriptions(merged);
      } else {
        const demoData = resetToDemoData();
        persistSubscriptions(demoData);
      }
      addActivity({
        type: 'reset',
        title: 'Demo Data Reloaded',
        description: 'Restored realistic sample subscriptions with relative dates',
      });
    },
    [subscriptions, persistSubscriptions, addActivity]
  );

  // JSON Export
  const exportData = useCallback(() => {
    exportSubscriptionsAsJSON(subscriptions);
  }, [subscriptions]);

  // JSON Import
  const importData = useCallback(
    (jsonString: string) => {
      try {
        const imported = validateAndImportSubscriptions(jsonString);
        setSubscriptions(imported);
        return { success: true, count: imported.length };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid JSON file format';
        return { success: false, error: msg };
      }
    },
    []
  );

  return {
    subscriptions,
    activities,
    filteredSubscriptions,
    attentionSubscriptions,
    renewingSoonSubscriptions,
    analyses,
    financialSummary,
    isLoaded,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    selectedCategory,
    setSelectedCategory,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    updateDecision,
    updateStatus,
    resetDemo,
    exportData,
    importData,
    addActivity,
  };
}
