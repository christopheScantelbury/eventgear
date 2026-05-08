import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'block font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted mb-1.5',
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = 'Label';
