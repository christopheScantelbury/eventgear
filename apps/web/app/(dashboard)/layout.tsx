'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ToastProvider } from '@/components/ui/toast';
import { OfflineStatusIndicator } from '@/components/offline/status-indicator';
import { ServiceWorkerRegistration } from '@/components/offline/sw-registration';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <ToastProvider>
      <ServiceWorkerRegistration />
      <div className="flex min-h-screen bg-dark-900">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0 bg-dark-900">{children}</main>
        <MobileNav />
      </div>
      <OfflineStatusIndicator />
    </ToastProvider>
  );
}
