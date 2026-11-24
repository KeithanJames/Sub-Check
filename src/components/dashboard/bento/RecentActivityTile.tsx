'use client';

import React from 'react';
import { ActivityLog } from '@/types/subscription';
import { Activity, Clock } from 'lucide-react';

interface RecentActivityTileProps {
  activities: ActivityLog[];
}

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return 'Recent';
  }
}

export function RecentActivityTile({ activities }: RecentActivityTileProps) {
  const displayActivities = activities.slice(0, 4);

  return (
    <div className="bento-tile p-5 flex flex-col justify-between col-span-1 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#141A27] text-slate-300 border border-[#232B3E]">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
            Recorded Activity Log
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          Audit
        </span>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-2.5 flex-1">
        {displayActivities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No activity recorded yet.
          </div>
        ) : (
          displayActivities.map((act) => {
            const isDecision = act.type === 'decision';
            const isStatus = act.type === 'status';
            const isAdd = act.type === 'add';

            return (
              <div
                key={act.id}
                className="flex items-start gap-2.5 p-2 rounded-xl bg-[#141A27]/60 border border-[#1E2536] text-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    isDecision
                      ? 'bg-[#D4F940]'
                      : isStatus
                      ? 'bg-sky-400'
                      : isAdd
                      ? 'bg-emerald-400'
                      : 'bg-purple-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-200 text-xs truncate">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {act.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2.5 border-t border-[#1B2232] mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>Logged in browser storage</span>
        <span className="font-mono">{activities.length} total events</span>
      </div>
    </div>
  );
}
