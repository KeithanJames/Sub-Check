import { Subscription, ActivityLog } from '../types/subscription';
import { generateDemoSubscriptions } from './demo-data';

const STORAGE_KEY = 'subcheck_subscriptions_v1';
const INITIALIZED_KEY = 'subcheck_demo_initialized_v1';
const ACTIVITIES_KEY = 'subcheck_activities_v1';

/**
 * Storage Abstraction Layer
 * Encapsulates browser localStorage with error handling and SSR safety.
 * This can be replaced by a Supabase or PostgreSQL client without changing UI code.
 */

export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__subcheck_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads subscriptions from localStorage.
 * Automatically bootstraps demo data only on first visit if storage is empty.
 */
export function getSavedSubscriptions(): Subscription[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const hasInitialized = window.localStorage.getItem(INITIALIZED_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // If first visit and nothing exists yet, load demo data
    if (!hasInitialized) {
      const demoData = generateDemoSubscriptions();
      saveSubscriptions(demoData);
      window.localStorage.setItem(INITIALIZED_KEY, 'true');
      return demoData;
    }

    return [];
  } catch (err) {
    console.error('SubCheck: Failed to read from localStorage:', err);
    return [];
  }
}

/**
 * Persists an array of subscriptions to localStorage.
 */
export function saveSubscriptions(subscriptions: Subscription[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    return true;
  } catch (err) {
    console.error('SubCheck: Failed to write to localStorage:', err);
    return false;
  }
}

/**
 * Resets storage back to fresh demo data with current relative dates.
 */
export function resetToDemoData(): Subscription[] {
  const demoData = generateDemoSubscriptions();
  saveSubscriptions(demoData);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(INITIALIZED_KEY, 'true');
  }
  return demoData;
}

/**
 * Clears all subscriptions from storage.
 */
export function clearAllSubscriptions(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Exports current subscriptions as a downloaded JSON file.
 */
export function exportSubscriptionsAsJSON(subscriptions: Subscription[]): void {
  if (typeof window === 'undefined') return;

  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(subscriptions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute('download', `subcheck-subscriptions-${timestamp}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (err) {
    console.error('SubCheck: Failed to export JSON:', err);
  }
}

/**
 * Imports subscriptions from a parsed JSON string.
 */
export function validateAndImportSubscriptions(jsonString: string): Subscription[] {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    throw new Error('Import file must contain a JSON array of subscriptions.');
  }

  // Validate basic shape
  for (const item of parsed) {
    if (!item.id || !item.name || typeof item.price !== 'number' || !item.category) {
      throw new Error(`Invalid subscription record found in file: ${item.name || 'unnamed'}`);
    }
  }

  saveSubscriptions(parsed);
  return parsed;
}

/**
 * Loads recorded user activities from localStorage.
 */
export function getSavedActivities(): ActivityLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(ACTIVITIES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    const now = new Date();
    const defaultActivities: ActivityLog[] = [
      {
        id: 'act-1',
        type: 'reset',
        title: 'Demo Subscriptions Initialized',
        description: 'Loaded 7 subscriptions with live dynamic renewals',
        timestamp: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'act-2',
        type: 'decision',
        title: 'Waste Engine Scan Completed',
        description: 'Flagged Netflix (75d inactive) & Xbox (68d inactive) for review',
        timestamp: new Date(now.getTime() - 1000 * 60 * 6).toISOString(),
      },
    ];
    saveActivities(defaultActivities);
    return defaultActivities;
  } catch {
    return [];
  }
}

/**
 * Persists activities to localStorage.
 */
export function saveActivities(activities: ActivityLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities.slice(0, 50)));
  } catch (err) {
    console.error('Failed to save activities:', err);
  }
}
