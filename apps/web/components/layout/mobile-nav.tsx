'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, CalendarDays, ClipboardCheck, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/dashboard/materials', icon: Package, label: 'Materiais' },
  { href: '/dashboard/events', icon: CalendarDays, label: 'Eventos' },
  { href: '/dashboard/checklist', icon: ClipboardCheck, label: 'Checklist' },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Relatórios' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
      <div className="flex">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                active ? 'text-blue-600' : 'text-gray-500',
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
