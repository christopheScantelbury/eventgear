'use client';

import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Checklist</h1>
        <p className="text-sm text-gray-500 mt-0.5">Selecione um evento para iniciar o checklist</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : allEvents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardCheck size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum evento ativo ou planejado</p>
          <Link href="/dashboard/events" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            Ver todos os eventos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allEvents.map((ev: any) => (
            <div key={ev.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                    <CalendarDays size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ev.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(ev.startDate)} · {ev.materials?.length ?? 0} materiais</p>
                  </div>
                </div>
                <Badge variant={ev.status === 'IN_PROGRESS' ? 'warning' : 'default'}>
                  {ev.status === 'IN_PROGRESS' ? 'Em andamento' : 'Planejado'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/checklist/${ev.id}/departure`}
                  className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ClipboardCheck size={14} />
                  Saída
                </Link>
                {ev.status === 'IN_PROGRESS' && (
                  <Link
                    href={`/dashboard/checklist/${ev.id}/return`}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ClipboardCheck size={14} />
                    Retorno
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
