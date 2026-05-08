'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  ClipboardCheck,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
  { href: '/dashboard/materials', icon: Package, label: 'Materiais' },
  { href: '/dashboard/events', icon: CalendarDays, label: 'Eventos' },
  { href: '/dashboard/checklist', icon: ClipboardCheck, label: 'Checklist' },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Relatórios' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignora */ }
    logout();
    window.location.href = '/login';
  }

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-600">EventGear</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Menu principal">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="mb-2 px-2">
          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          <span className="mt-1 inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {user?.role === 'ADMIN' ? 'Admin' : 'Operador'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
