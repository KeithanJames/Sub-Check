'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel, RecommendedAction, SubscriptionStatus } from '@/types/subscription';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'risk' | 'status' | 'action' | 'lime' | 'lavender';
  riskLevel?: RiskLevel;
  status?: SubscriptionStatus;
  action?: RecommendedAction;
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  className,
  variant = 'default',
  riskLevel,
  status,
  action,
  size = 'md',
  ...props
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  let variantClasses = 'bg-[#151B27] text-slate-300 border border-[#232B3E]';

  if (variant === 'lime') {
    variantClasses = 'bg-[#D4F940]/10 text-[#D4F940] border border-[#D4F940]/30 font-semibold';
  } else if (variant === 'lavender') {
    variantClasses = 'bg-[#C4B5FD]/10 text-[#DDD6FE] border border-[#C4B5FD]/30 font-semibold';
  } else if (variant === 'risk' && riskLevel) {
    switch (riskLevel) {
      case 'low':
        variantClasses = 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50';
        break;
      case 'moderate':
        variantClasses = 'bg-amber-950/60 text-amber-300 border border-amber-800/50';
        break;
      case 'high':
        variantClasses = 'bg-rose-950/70 text-rose-300 border border-rose-800/60';
        break;
      case 'urgent':
        variantClasses = 'bg-rose-950 text-rose-200 border border-rose-600/80 font-semibold animate-pulse';
        break;
    }
  } else if (variant === 'status' && status) {
    switch (status) {
      case 'active':
        variantClasses = 'bg-[#D4F940]/10 text-[#D4F940] border border-[#D4F940]/25';
        break;
      case 'trial':
        variantClasses = 'bg-sky-950/60 text-sky-300 border border-sky-800/50';
        break;
      case 'paused':
        variantClasses = 'bg-amber-950/50 text-amber-300 border border-amber-800/40';
        break;
      case 'canceled':
        variantClasses = 'bg-[#131722] text-slate-400 border border-slate-800 line-through';
        break;
    }
  } else if (variant === 'action' && action) {
    switch (action) {
      case 'keep':
        variantClasses = 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40';
        break;
      case 'review':
        variantClasses = 'bg-amber-950/40 text-amber-300 border border-amber-800/40';
        break;
      case 'cancel_or_pause':
        variantClasses = 'bg-rose-950/50 text-rose-300 border border-rose-800/50';
        break;
      case 'downgrade':
        variantClasses = 'bg-purple-950/40 text-purple-300 border border-purple-800/40';
        break;
      case 'renewal_soon':
        variantClasses = 'bg-rose-950/50 text-rose-200 border border-rose-700/60';
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full tracking-wide transition-colors whitespace-nowrap',
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
