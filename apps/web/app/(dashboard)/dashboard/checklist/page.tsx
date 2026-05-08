'use client';

import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EventStatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';

export default function ChecklistIndexPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['events', 'active'],
    queryFn: () => eventsApi.list({ status: 'IN_PROGRESS', limit: 50 }),
  });

  const { data: planned } = useQuery({
    queryKey: ['events', 'planned'],
    queryFn: () => eventsApi.list({ status: 'PLANNED', limit: 50 }),
  });

  const activeEvents = data?.items ?? [];
  const plannedEvents = planned?.items ?? [];
  const allEvents = [...activeEvents, ...plannedEvents];

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
          Checklist
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Selecione um evento para iniciar o checklist de saída ou retorno.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : allEvents.length === 0 ? (
        <div className="text-center py-16 text-text-muted bg-dark-800 border border-dark-border rounded-xl">
          <ClipboardCheck size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-display font-bold text-lg tracking-wide text-text-secondary">
            Nenhum evento ativo ou planejado
          </p>
          <Link
            href="/dashboard/events"
            className="mt-3 inline-block text-sm text-amber-400 hover:text-amber-300 font-medium"
          >
            Ver todos os eventos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allEvents.map((ev: any) => (
            <div
              key={ev.id}
              className="bg-dark-800 border border-dark-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-dark-700 border border-dark-border-med rounded-md flex items-center justify-center shrink-0">
                    <CalendarDays size={16} className="text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-base text-text-primary truncate">
                      {ev.name}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 font-mono">
                      {formatDate(ev.startDate)} · {ev.materials?.length ?? 0} materiais
                    </p>
                  </div>
                </div>
                <EventStatusBadge status={ev.status} />
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/checklist/${ev.id}/departure`} className="flex-1">
                  <Button block size="md" variant="primary">
                    <ClipboardCheck size={14} />
                    Saída
                  </Button>
                </Link>
                {ev.status === 'IN_PROGRESS' && (
                  <Link href={`/dashboard/checklist/${ev.id}/return`} className="flex-1">
                    <Button block size="md" variant="success">
                      <ClipboardCheck size={14} />
                      Retorno
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
