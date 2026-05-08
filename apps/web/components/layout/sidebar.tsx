'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { canAccess, ROLE_LABELS, ROLE_COLORS, type AppModule } from '@/lib/permissions';
import { LogoMark } from '@/components/brand/logo';

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
  module: AppModule;
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Operação',
    items: [
      { href: '/dashboard',  label: 'Dashboard',    exact: true, module: 'dashboard'  },
      { href: '/materiais',  label: 'Materiais',                  module: 'materiais'  },
      { href: '/eventos',    label: 'Eventos',                    module: 'eventos'    },
      { href: '/relatorios', label: 'Relatórios',                 module: 'relatorios' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/configuracoes', label: 'Configurações', module: 'configuracoes' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignora */ }
    logout();
    window.location.href = '/login';
  }

  const role = user?.role;

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col w-60 shrink-0',
        'bg-dark-950 border-r border-dark-border',
        'sticky top-0 h-screen',
      )}
      aria-label="Navegação principal"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-6 border-b border-dark-border">
        <LogoMark size={26} />
        <span className="font-display text-xl font-extrabold tracking-wide text-text-primary leading-none">
          Event<span className="text-amber-500">Gear</span>
        </span>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => canAccess(role, item.module));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label} className="mb-4">
              <span className="block font-mono text-[9px] uppercase tracking-[2px] text-text-muted px-2 pt-3 pb-2">
                {section.label}
              </span>
              <ul className="space-y-0.5">
                {visibleItems.map(({ href, label, exact }) => {
                  const active = exact
                    ? pathname === href
                    : pathname === href || pathname.startsWith(href + '/');
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-2 px-2.5 py-2 rounded-md',
                          'font-semi text-[13px] font-medium',
                          'transition-colors',
                          active
                            ? 'bg-amber-500/12 text-amber-400'
                            : 'text-text-secondary hover:bg-dark-800 hover:text-text-primary',
                        )}
                      >
                        <span
                          className={cn(
                            'w-1.5 h-1.5 rounded-full bg-current shrink-0',
                            active ? 'opacity-100' : 'opacity-60',
                          )}
                        />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-dark-border">
        <div className="mb-3">
          <p className="text-sm font-medium text-text-primary truncate">{user?.name ?? '—'}</p>
          <p className="text-xs text-text-muted truncate mb-2">{user?.email}</p>
          {role && (
            <span className={cn(
              'text-[10px] font-mono font-semibold border px-2 py-0.5 rounded-full',
              ROLE_COLORS[role],
            )}>
              {ROLE_LABELS[role]}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2 w-full px-2.5 py-2 rounded-md',
            'font-semi text-[13px] font-medium',
            'text-text-secondary hover:bg-status-lost/10 hover:text-status-lost',
            'transition-colors',
          )}
        >
          <LogOut size={14} />
          Sair
        </button>
        <p className="font-mono text-[9px] tracking-[1px] text-text-muted mt-3 leading-tight">
          SCANTELBURYDEVS
          <br />
          v1.0 · 2026
        </p>
      </div>
    </aside>
  );
}
