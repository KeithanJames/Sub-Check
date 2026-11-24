'use client';

import React from 'react';
import { FilterType, SubscriptionCategory } from '@/types/subscription';
import { Filter, X } from 'lucide-react';

interface SubscriptionFiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedCategory: SubscriptionCategory | 'all';
  onCategoryChange: (category: SubscriptionCategory | 'all') => void;
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onClearSearch: () => void;
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

export function SubscriptionFilters({
  currentFilter,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
  totalCount,
  filteredCount,
  searchQuery,
  onClearSearch,
}: SubscriptionFiltersProps) {
  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'trial', label: 'Trial' },
    { id: 'likely_unused', label: 'Likely Unused' },
    { id: 'review', label: 'Needs Review' },
    { id: 'renewing_soon', label: 'Renewing Soon' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => {
            const isSelected = currentFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#0E131E] text-white border border-[#D4F940]/70 font-semibold shadow-sm'
                    : 'bg-[#0E131E]/70 text-slate-400 hover:text-slate-200 hover:bg-[#151C2C] border border-[#1B2232]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) =>
                onCategoryChange(e.target.value as SubscriptionCategory | 'all')
              }
              aria-label="Filter by category"
              className="text-xs pl-3 pr-8 py-1.5 rounded-xl bg-[#0E131E] border border-[#1B2232] text-slate-300 focus:outline-none focus:border-[#D4F940] transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span className="text-xs text-slate-500 font-mono hidden md:inline">
            Showing {filteredCount} of {totalCount}
          </span>
        </div>
      </div>

      {/* Active Search Badge */}
      {searchQuery && (
        <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 font-mono">
          <span>Search query: &quot;{searchQuery}&quot;</span>
          <button
            onClick={onClearSearch}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#161C29] border border-[#1B2232] text-slate-300 hover:text-white"
          >
            <span>Clear</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
