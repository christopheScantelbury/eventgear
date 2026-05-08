import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon?: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  iconClassName?: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-dark-800 border border-dark-border rounded-xl p-5',
        'transition-colors hover:border-dark-border-med',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              'inline-flex items-center justify-center w-8 h-8 rounded-md',
              'bg-dark-700 border border-dark-border-med text-amber-400',
              iconClassName,
            )}
          >
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="font-display text-4xl font-extrabold tracking-tight text-text-primary leading-none">
        {value}
      </p>
      {sub && <p className="text-xs text-text-muted mt-2">{sub}</p>}
    </div>
  );
}
