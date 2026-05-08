import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md px-3.5 py-2.5 text-sm',
        'bg-dark-950 text-text-primary',
        'border border-dark-border-med',
        'focus:outline-none focus:border-amber-600 focus:ring-[3px] focus:ring-amber-500/12',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'appearance-none bg-no-repeat bg-right-3',
        // chevron arrow via inline svg background
        '[background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2024%2024%27%20stroke%3D%27%2394A3B8%27%3E%3Cpath%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20d%3D%27M19%209l-7%207-7-7%27%2F%3E%3C/svg%3E")] bg-[length:18px_18px] bg-[right_12px_center] pr-10',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';
