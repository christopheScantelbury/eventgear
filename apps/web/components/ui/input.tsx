import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: 'default' | 'success' | 'error';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state = 'default', ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md px-3.5 py-2.5 text-sm',
        'bg-dark-950 text-text-primary',
        'border transition-colors',
        'placeholder:text-text-muted',
        'focus:outline-none focus:ring-[3px] focus:ring-amber-500/12',
        'disabled:cursor-not-allowed disabled:opacity-50',
        state === 'default' && 'border-dark-border-med focus:border-amber-600',
        state === 'success' && 'border-status-available focus:border-status-available focus:ring-status-available/12',
        state === 'error' && 'border-status-lost focus:border-status-lost focus:ring-status-lost/12',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
