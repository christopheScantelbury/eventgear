import { cn } from '@/lib/utils';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * EventGear logo mark — gear icon in amber.
 * Uses currentColor on the wordmark only via parent context.
 */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 4a16 16 0 0 1 0 32 16 16 0 0 1 0-32z"
        stroke="#F59E0B"
        strokeWidth="2"
      />
      <circle cx="20" cy="20" r="5" fill="#F59E0B" />
      <path
        d="M20 4v6M20 30v6M4 20h6M30 20h6"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M8.7 8.7l4.2 4.2M27.1 27.1l4.2 4.2M8.7 31.3l4.2-4.2M27.1 12.9l4.2-4.2"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const wordmarkSizes = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
};

export function Wordmark({ size = 'md', className }: WordmarkProps) {
  return (
    <span
      className={cn(
        'font-display font-extrabold tracking-wide leading-none text-text-primary',
        wordmarkSizes[size],
        className,
      )}
    >
      Event<span className="text-amber-500">Gear</span>
    </span>
  );
}

interface BrandLockupProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  iconSize?: number;
}

export function BrandLockup({ size = 'md', className, iconSize }: BrandLockupProps) {
  const defaultIconSizes = { sm: 22, md: 28, lg: 40, xl: 56 };
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={iconSize ?? defaultIconSizes[size]} />
      <Wordmark size={size} />
    </div>
  );
}
