'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, CalendarDays, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início', exact: true },
  { href: '/materiais', icon: Package, label: 'Materiais' },
  { href: '/eventos', icon: CalendarDays, label: 'Eventos' },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'md:hidden fixed bottom-0 left-0 right-0 z-40',
        'bg-dark-950 border-t border-dark-border',
        'safe-area-bottom',
      )}
      aria-label="Navegação inferior"
    >
      <div className="flex">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'touch-target flex-1 flex flex-col items-center justify-center gap-1 py-2',
                'transition-colors',
                active ? 'text-amber-400' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              <Icon size={20} />
              <span className="font-mono text-[9px] uppercase tracking-[1px]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
