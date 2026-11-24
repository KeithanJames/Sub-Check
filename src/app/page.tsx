'use client';

import React, { useState } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BentoDashboard } from '@/components/dashboard/bento/BentoDashboard';
import { RenewalWarnings } from '@/components/dashboard/RenewalWarnings';
import { AttentionPanel } from '@/components/dashboard/AttentionPanel';
import { SubscriptionFilters } from '@/components/subscriptions/SubscriptionFilters';
import { SubscriptionTable } from '@/components/subscriptions/SubscriptionTable';
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList';
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard';
import { SubscriptionFormModal } from '@/components/subscriptions/SubscriptionFormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Subscription, UserDecision, SubscriptionStatus } from '@/types/subscription';
import { formatCurrencyINR } from '@/lib/calculations';
import {
  Sparkles,
  CreditCard,
  CalendarClock,
  ShieldAlert,
  CheckCircle,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  TrendingDown,
} from 'lucide-react';

export default function SubCheckApp() {
  const {
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
  } = useSubscriptions();

  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'subscriptions' | 'waste' | 'renewals'>('dashboard');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Toast / User Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers
  const handleOpenAdd = () => {
    setEditingSub(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setIsAddEditModalOpen(true);
  };

  const handleFormSubmit = (subData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSub) {
      updateSubscription(editingSub.id, subData);
      showToast(`Updated "${subData.name}" successfully.`);
    } else {
      addSubscription(subData);
      showToast(`Added "${subData.name}" to your subscriptions.`);
    }
    setEditingSub(null);
  };

  const handleConfirmDelete = () => {
    if (deletingSubId) {
      const target = subscriptions.find((s) => s.id === deletingSubId);
      deleteSubscription(deletingSubId);
      showToast(`Removed "${target?.name || 'subscription'}".`);
      setDeletingSubId(null);
    }
  };

  const handleConfirmResetDemo = () => {
    resetDemo(false);
    showToast('Loaded fresh dynamic demo subscriptions.');
    setIsResetConfirmOpen(false);
  };

  const handleImportJSON = (jsonString: string) => {
    const result = importData(jsonString);
    if (result.success) {
      showToast(`Successfully imported ${result.count} subscriptions!`);
    } else {
      alert(`Import error: ${result.error}`);
    }
  };

  const handleUpdateDecision = (id: string, decision: UserDecision) => {
    const target = subscriptions.find((s) => s.id === id);
    const analysis = analyses.get(id);
    updateDecision(id, decision);

    const subName = target?.name || 'Subscription';
    const annualSaved = analysis ? formatCurrencyINR(analysis.annualEquivalent) : '';

    switch (decision) {
      case 'cancel':
        showToast(`Decision: Cancel "${subName}" (${annualSaved}/yr savings planned). Remember to cancel with provider!`);
        break;
      case 'pause':
        showToast(`Decision: Pause "${subName}". Remember to pause billing with provider.`);
        break;
      case 'downgrade':
        showToast(`Decision: Downgrade "${subName}". Explore a cheaper plan with provider.`);
        break;
      case 'keep':
        showToast(`Decision: Keep "${subName}". Removed from pending cancellation savings.`);
        break;
      case 'review':
        showToast(`Decision: Flagged "${subName}" for review.`);
        break;
    }
  };

  const handleUpdateStatus = (id: string, status: SubscriptionStatus) => {
    const target = subscriptions.find((s) => s.id === id);
    const analysis = analyses.get(id);
    updateStatus(id, status);

    const subName = target?.name || 'Subscription';
    const annualSaved = analysis ? formatCurrencyINR(analysis.annualEquivalent) : '';

    switch (status) {
      case 'canceled':
        showToast(`Status updated: "${subName}" marked as Canceled with provider. ${annualSaved}/yr actual savings realized!`);
        break;
      case 'paused':
        showToast(`Status updated: "${subName}" marked as Paused.`);
        break;
      case 'active':
        showToast(`Status updated: "${subName}" marked as Active.`);
        break;
      case 'trial':
        showToast(`Status updated: "${subName}" marked as Trial.`);
        break;
    }
  };

  const subToDelete = subscriptions.find((s) => s.id === deletingSubId);

  // Hydration Loading Skeleton
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#08090C] flex items-center justify-center p-6 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0E131E] border border-[#D4F940]/30 text-[#D4F940] flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-mono tracking-wider text-slate-400">Loading SubCheck Bento Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0E131E] border border-[#D4F940]/40 text-white shadow-2xl shadow-black/80 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-[#D4F940] shrink-0" />
          <span className="font-medium font-sans">{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab as typeof currentTab)}
        summary={financialSummary}
        onResetDemo={() => setIsResetConfirmOpen(true)}
        onExport={exportData}
        onTriggerImport={() => {
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          fileInput?.click();
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Header */}
        <Header
          onOpenAddModal={handleOpenAdd}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onImportFile={handleImportJSON}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: 21st.dev BENTO DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Asymmetrical 4-Column Bento Grid */}
              <BentoDashboard
                summary={financialSummary}
                subscriptions={subscriptions}
                attentionSubscriptions={attentionSubscriptions}
                analyses={analyses}
                activities={activities}
                onOpenWasteTab={() => setCurrentTab('waste')}
                onOpenSubscriptions={() => setCurrentTab('subscriptions')}
                onOpenRenewals={() => setCurrentTab('renewals')}
                onSelectSubscription={(sub) => handleOpenEdit(sub)}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setCurrentTab('subscriptions');
                }}
              />

              {/* Renewal Warnings Banner (if any within 7 days) */}
              <RenewalWarnings
                renewingSubscriptions={renewingSoonSubscriptions}
                analyses={analyses}
                onSelectSubscription={(sub) => handleOpenEdit(sub)}
                onFilterRenewingSoon={() => {
                  setSelectedFilter('renewing_soon');
                  setCurrentTab('subscriptions');
                }}
              />

              {/* Quick Interactive Subscriptions Table */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight font-mono uppercase">
                      All Subscriptions Overview
                    </h2>
                    <p className="text-xs text-slate-400">
                      Information-dense inventory with interactive decision controls.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentTab('subscriptions')}
                    className="self-start sm:self-center text-xs font-semibold text-[#D4F940] hover:underline transition-all"
                  >
                    Open Full Management Tab &rarr;
                  </button>
                </div>

                <SubscriptionFilters
                  currentFilter={selectedFilter}
                  onFilterChange={setSelectedFilter}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  totalCount={subscriptions.length}
                  filteredCount={filteredSubscriptions.length}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                />

                <SubscriptionTable
                  subscriptions={subscriptions}
                  filteredSubscriptions={filteredSubscriptions}
                  analyses={analyses}
                  onEdit={handleOpenEdit}
                  onDelete={(id) => setDeletingSubId(id)}
                  onUpdateDecision={handleUpdateDecision}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenAddModal={handleOpenAdd}
                  onResetFilters={() => {
                    setSelectedFilter('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED SUBSCRIPTION MANAGEMENT */}
          {currentTab === 'subscriptions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-mono">
                    <CreditCard className="w-5 h-5 text-[#D4F940]" />
                    SUBSCRIPTION INVENTORY
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search, filter, update decisions, and manage provider status across recurring services.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-[#0E131E] border border-[#1B2232] rounded-xl p-0.5">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                        viewMode === 'table'
                          ? 'bg-[#182030] text-[#D4F940] shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Compact Table View"
                    >
                      <TableIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                        viewMode === 'cards'
                          ? 'bg-[#182030] text-[#D4F940] shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Card Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-black bg-[#D4F940] hover:bg-[#C4EB2E] border border-[#D4F940] shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>New Subscription</span>
                  </button>
                </div>
              </div>

              <SubscriptionFilters
                currentFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                totalCount={subscriptions.length}
                filteredCount={filteredSubscriptions.length}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />

              {viewMode === 'table' ? (
                <SubscriptionTable
                  subscriptions={subscriptions}
                  filteredSubscriptions={filteredSubscriptions}
                  analyses={analyses}
                  onEdit={handleOpenEdit}
                  onDelete={(id) => setDeletingSubId(id)}
                  onUpdateDecision={handleUpdateDecision}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenAddModal={handleOpenAdd}
                  onResetFilters={() => {
                    setSelectedFilter('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                />
              ) : (
                <SubscriptionList
                  subscriptions={subscriptions}
                  filteredSubscriptions={filteredSubscriptions}
                  analyses={analyses}
                  onEdit={handleOpenEdit}
                  onDelete={(id) => setDeletingSubId(id)}
                  onUpdateDecision={handleUpdateDecision}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenAddModal={handleOpenAdd}
                  onResetFilters={() => {
                    setSelectedFilter('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                />
              )}
            </div>
          )}

          {/* TAB 3: DEDICATED WASTE DETECTION ENGINE */}
          {currentTab === 'waste' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-mono">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    SUBSCRIPTION WASTE ENGINE
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Algorithmic review of inactive services, renewal risks, and category overlaps.
                  </p>
                </div>

                {financialSummary.potentialAnnualSavings > 0 && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-[#0E131E] border border-[#D4F940]/30 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-[#D4F940]" />
                    <span className="text-xs font-mono text-slate-300">
                      Reclaimable Waste:{' '}
                      <strong className="text-[#D4F940]">
                        {formatCurrencyINR(financialSummary.potentialAnnualSavings)}
                      </strong>
                      /yr
                    </span>
                  </div>
                )}
              </div>

              <AttentionPanel
                attentionSubscriptions={attentionSubscriptions}
                analyses={analyses}
                onUpdateDecision={handleUpdateDecision}
                onSelectSubscription={(sub) => handleOpenEdit(sub)}
              />

              {/* Waste Engine Rules Explainer for Mentorship/Demonstration */}
              <div className="bento-tile p-5 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#D4F940]" />
                  Engine Rules &amp; Rationale Matrix
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-[#08090C] border border-[#1B2232]">
                    <span className="font-semibold text-red-400 block mb-1 font-mono text-[11px]">
                      1. URGENT RENEWAL ALARM
                    </span>
                    Renews in $\le$ 7 days with prolonged inactivity ($&gt;$ 60 days or marked &apos;never&apos;). Highlights imminent card charges so the user can intervene immediately.
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#08090C] border border-[#1B2232]">
                    <span className="font-semibold text-rose-400 block mb-1 font-mono text-[11px]">
                      2. PROLONGED INACTIVITY
                    </span>
                    Over 60 days without recorded use, or frequency marked &apos;Never&apos;. High-confidence candidate for cancellation or indefinite pause.
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#08090C] border border-[#1B2232]">
                    <span className="font-semibold text-amber-400 block mb-1 font-mono text-[11px]">
                      3. UNDERUTILIZED REVIEW
                    </span>
                    Last used 31–60 days ago. Flagged for review to see if a downgraded tier, shared family plan, or on-demand purchase makes better economic sense.
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#08090C] border border-[#1B2232]">
                    <span className="font-semibold text-[#C4B5FD] block mb-1 font-mono text-[11px]">
                      4. CATEGORY REDUNDANCY
                    </span>
                    Detects when two or more active subscriptions exist in the same category (e.g. Netflix, Spotify, Prime, YouTube). Encourages single-service rotation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RENEWALS TIMELINE */}
          {currentTab === 'renewals' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-mono">
                  <CalendarClock className="w-5 h-5 text-[#C4B5FD]" />
                  RENEWAL TIMELINE &amp; CASHFLOW
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track upcoming billing dates chronologically to eliminate billing surprises.
                </p>
              </div>

              {/* Renewal Warnings Banner */}
              <RenewalWarnings
                renewingSubscriptions={renewingSoonSubscriptions}
                analyses={analyses}
                onSelectSubscription={(sub) => handleOpenEdit(sub)}
                onFilterRenewingSoon={() => {}}
              />

              {/* All active subscriptions sorted by days until renewal */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Full Chronological Renewal Feed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...subscriptions]
                    .sort((a, b) => {
                      const da = analyses.get(a.id)?.daysUntilRenewal ?? 999;
                      const db = analyses.get(b.id)?.daysUntilRenewal ?? 999;
                      return da - db;
                    })
                    .map((sub) => (
                      <SubscriptionCard
                        key={sub.id}
                        subscription={sub}
                        analysis={analyses.get(sub.id)}
                        onEdit={handleOpenEdit}
                        onDelete={(id) => setDeletingSubId(id)}
                        onUpdateDecision={handleUpdateDecision}
                        onUpdateStatus={handleUpdateStatus}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Subscription Modal */}
      <SubscriptionFormModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialSubscription={editingSub}
        existingSubscriptions={subscriptions}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletingSubId !== null}
        onClose={() => setDeletingSubId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Subscription"
        message={`Are you sure you want to delete "${subToDelete?.name || 'this subscription'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Keep"
        isDestructive={true}
      />

      {/* Demo Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmResetDemo}
        title="Reset Demo Subscriptions"
        message="This will reload the realistic sample subscriptions (Netflix, Spotify, Canva, Amazon Prime, Xbox Game Pass, etc.) with relative renewal dates. Any custom subscriptions you added will be replaced unless exported."
        confirmText="Reset to Demo"
        cancelText="Cancel"
        isDestructive={false}
      />
    </div>
  );
}
