'use client';

import * as React from 'react';
import { QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BtnQrProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/**
 * Specialty button for QR-code actions — bordered amber, glow on hover.
 * Designed for primary scan action ("ESCANEAR QR CODE").
 */
export const BtnQr = React.forwardRef<HTMLButtonElement, BtnQrProps>(
  ({ className, children, label = 'Escanear QR Code', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2.5',
        'px-5 py-3.5 rounded-md',
        'bg-dark-700 text-text-primary',
        'border-[1.5px] border-amber-600',
        'font-display font-bold uppercase tracking-[1px] text-base',
        'transition-all duration-200',
        'hover:bg-amber-500/12 hover:border-amber-400 hover:shadow-amber-glow',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      <QrCode size={20} className="text-amber-500" />
      {children ?? label}
    </button>
  ),
);
BtnQr.displayName = 'BtnQr';
