'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EventStatusBadge } from '@/components/ui/status-badge';
import { STATUS_LABELS, formatDate, cn } from '@/lib/utils';

const STATUS_TOP_BAR: Record<string, string> = {
  PLANNED: 'bg-dark-border-med',
  IN_PROGRESS: 'bg-amber-500',
  COMPLETED: 'bg-status-available',
  CANCELLED: 'bg-text-muted',
};

export default function EventosPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['events', page, search, status],
    queryFn: () =>
      eventsApi.list({
        page,
        limit: 20,
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const events = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
            Eventos
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Gerencie eventos e alocações de equipamento.
          </p>
        </div>
        {isAdmin && (
          <Link href="/eventos/novo">
            <Button size="md">
              <Plus size={16} />
              Novo
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <Input
            placeholder="Buscar eventos..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          className="w-40"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-text-muted bg-dark-800 border border-dark-border rounded-xl">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-display font-bold text-lg tracking-wide text-text-secondary">
            Nenhum evento encontrado
          </p>
          {isAdmin && (
            <Link
              href="/eventos/novo"
              className="mt-3 inline-block text-sm text-amber-400 hover:text-amber-300 font-medium"
            >
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
                href={`/eventos/${ev.id}`}
                className="group relative flex items-center gap-4 bg-dark-800 border border-dark-border rounded-xl px-4 py-3 hover:border-dark-border-med transition-colors overflow-hidden"
              >
                <span
                  className={cn(
                    'absolute top-0 left-0 right-0 h-[3px]',
                    STATUS_TOP_BAR[ev.status] ?? 'bg-dark-border-med',
                  )}
                />
                <div className="w-11 h-11 bg-dark-700 border border-dark-border-med rounded-md flex items-center justify-center shrink-0">
                  <CalendarDays size={18} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-base text-text-primary truncate">
                    {ev.name}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {ev.client && `${ev.client} · `}
                    <span className="font-mono">
                      {formatDate(ev.startDate)} → {formatDate(ev.returnDate)}
                    </span>
                    {ev.location && ` · ${ev.location}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs text-text-muted hidden sm:inline">
                    {ev.materials?.length ?? 0} itens
                  </span>
                  <EventStatusBadge status={ev.status} />
                </div>
              </Link>
            ))}
          </div>

          {meta && meta.pages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="font-mono text-xs text-text-secondary">
                {page} / {meta.pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      {/* FAB mobile */}
      {isAdmin && (
        <Link
          href="/eventos/novo"
          className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-amber-500 hover:bg-amber-400 text-dark-900 rounded-full flex items-center justify-center shadow-lg transition-colors z-30"
          aria-label="Novo evento"
        >
          <Plus size={24} />
        </Link>
      )}
    </div>
  );
}
