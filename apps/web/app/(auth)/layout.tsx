import { BrandLockup } from '@/components/brand/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandLockup size="lg" />
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[2px] text-text-muted">
          Equipment Control · ScantelburyDevs
        </p>
      </div>

      <div className="w-full max-w-md bg-dark-800 rounded-2xl border border-dark-border shadow-2xl p-8">
        {children}
      </div>

      <p className="mt-6 font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
        Build · Migrate · Innovate
      </p>
    </div>
  );
}
