import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-blue-100 text-blue-800',
        available: 'bg-green-100 text-green-800',
        allocated: 'bg-yellow-100 text-yellow-800',
        maintenance: 'bg-purple-100 text-purple-800',
        lost: 'bg-red-100 text-red-800',
        confirmed: 'bg-green-100 text-green-800',
        pending: 'bg-gray-100 text-gray-700',
        missing: 'bg-red-100 text-red-800',
        damaged: 'bg-orange-100 text-orange-800',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
