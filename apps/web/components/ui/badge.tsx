import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5',
    'font-mono text-[11px] font-medium',
    'px-2.5 py-1 rounded-xs',
    'uppercase tracking-wider',
    'border',
    "before:content-['●'] before:text-[8px]",
  ].join(' '),
  {
    variants: {
      variant: {
        // Material status (semantic — never reuse colors)
        available:
          'bg-status-available/12 text-status-available border-status-available/25',
        allocated:
          'bg-status-allocated/12 text-status-allocated border-status-allocated/25',
        maintenance:
          'bg-status-maintenance/12 text-status-maintenance border-status-maintenance/25',
        lost: 'bg-status-lost/12 text-status-lost border-status-lost/25',

        // Event status
        planned: 'bg-dark-700 text-text-secondary border-dark-border-med',
        'in-progress':
          'bg-amber-500/12 text-amber-400 border-amber-500/25',
        completed:
          'bg-status-available/12 text-status-available border-status-available/25',
        cancelled: 'bg-dark-700 text-text-muted border-dark-border-med',

        // Roles
        admin: 'bg-amber-500/8 text-amber-400 border-amber-500/20',
        operator: 'bg-dark-700 text-text-secondary border-dark-border-med',

        // Generic / legacy aliases (kept for backwards compat)
        default: 'bg-amber-500/12 text-amber-400 border-amber-500/25',
        success:
          'bg-status-available/12 text-status-available border-status-available/25',
        warning:
          'bg-status-allocated/12 text-status-allocated border-status-allocated/25',
        destructive:
          'bg-status-lost/12 text-status-lost border-status-lost/25',
        secondary: 'bg-dark-700 text-text-secondary border-dark-border-med',
        purple:
          'bg-status-maintenance/12 text-status-maintenance border-status-maintenance/25',
        event:
          'bg-purple-500/12 text-purple-300 border-purple-500/20',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
