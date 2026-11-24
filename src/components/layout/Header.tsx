'use client';

import React, { useRef } from 'react';
import { Plus, Menu, Search, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenMobileSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onImportFile: (jsonString: string) => void;
}

export function Header({
  onOpenAddModal,
  onOpenMobileSidebar,
  searchQuery,
  onSearchChange,
  onImportFile,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportFile(content);
      }
    };
    reader.readAsText(file);
    // Reset so same file can be selected again
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-30 bg-[#08090C]/85 backdrop-blur-md border-b border-[#1B2232] px-4 sm:px-8 py-3.5">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile menu button & Search Input */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#0E131E] border border-[#1B2232] lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search subscriptions, categories, notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#0E131E] border border-[#1B2232] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#D4F940] focus:ring-1 focus:ring-[#D4F940] transition-colors font-sans"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-[#0E131E] px-3 py-1.5 rounded-xl border border-[#1B2232]">
            <span className="w-2 h-2 rounded-full bg-[#D4F940] animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300">Client-Side Vault</span>
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-black bg-[#D4F940] hover:bg-[#C4EB2E] border border-[#D4F940] shadow-md shadow-[#D4F940]/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>
    </header>
  );
}
