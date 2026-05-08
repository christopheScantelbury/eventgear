import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semi font-semibold tracking-wide',
    'leading-none',
    'transition-all duration-150',
    'border border-transparent',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-amber-500 text-dark-900 shadow-amber-soft hover:bg-amber-400 hover:shadow-amber-strong active:bg-amber-600',
        secondary:
          'bg-amber-500/12 text-amber-400 border-amber-500/25 hover:bg-amber-500/20',
        ghost:
          'bg-transparent text-text-secondary border-dark-border-med hover:bg-dark-700 hover:text-text-primary',
        danger:
          'bg-red-400/12 text-red-400 border-red-400/25 hover:bg-red-400/20',
        success:
          'bg-status-available/15 text-status-available border-status-available/30 hover:bg-status-available/25',
      },
      size: {
        sm: 'h-9 px-3 text-[13px] rounded-md',
        md: 'h-11 px-[18px] text-sm rounded-md',
        lg: 'h-12 px-[22px] text-[15px] rounded-md',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
