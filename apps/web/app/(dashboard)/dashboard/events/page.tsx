'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { STATUS_LABELS, formatDate } from '@/lib/utils';

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PLANNED: 'default',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'secondary',
};

export default function EventsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['events', page, search, status],
    queryFn: () => eventsApi.list({ page, limit: 20, search: search || undefined, status: status || undefined }),
  });

  const events = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie eventos e alocações</p>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/events/new"
            className="flex items-center gap-2 h-10 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Novo
          </Link>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar eventos..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select
          className="w-40"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">Todos</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum evento encontrado</p>
          {isAdmin && (
            <Link href="/dashboard/events/new" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
              Criar primeiro evento
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {events.map((ev: any) => (
              <Link
                key={ev.id}
                href={`/dashboard/events/${ev.id}`}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                  <CalendarDays size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{ev.name}</p>
                  <p className="text-xs text-gray-500">
                    {ev.client && `${ev.client} · `}
                    {formatDate(ev.startDate)} → {formatDate(ev.returnDate)}
                    {ev.location && ` · ${ev.location}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">{ev.materials?.length ?? 0} itens</span>
                  <Badge variant={STATUS_VARIANT[ev.status] ?? 'secondary'}>
                    {STATUS_LABELS[ev.status as keyof typeof STATUS_LABELS] ?? ev.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>

          {meta && meta.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-500">{page} / {meta.pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
