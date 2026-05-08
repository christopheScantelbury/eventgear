'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, Package, CalendarDays, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { reportsApi, eventsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { EventStatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';

export default function RelatoriosPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: reportsApi.dashboard,
  });

  const { data: completedData } = useQuery({
    queryKey: ['events', 'completed'],
    queryFn: () => eventsApi.list({ status: 'COMPLETED', limit: 10 }),
  });

  const completedEvents = completedData?.items ?? [];

  return (
    <div className="px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
          Relatórios
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Visão geral do uso de equipamentos e operações.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <StatCard
            icon={Package}
            label="Materiais"
            value={dashboard?.materials?.total ?? 0}
            sub="total cadastrados"
          />
          <StatCard
            icon={CheckCircle2}
            label="Disponíveis"
            value={dashboard?.materials?.available ?? 0}
            sub="prontos para uso"
            iconClassName="text-status-available"
          />
          <StatCard
            icon={CalendarDays}
            label="Eventos"
            value={dashboard?.events?.total ?? 0}
            sub="total registrados"
            iconClassName="text-status-maintenance"
          />
          <StatCard
            icon={Clock}
            label="Em andamento"
            value={dashboard?.events?.active ?? 0}
            sub="ativos agora"
            iconClassName="text-amber-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Concluídos"
            value={dashboard?.events?.completed ?? 0}
            sub="finalizados"
            iconClassName="text-status-available"
          />
          <StatCard
            icon={BarChart3}
            label="Este mês"
            value={dashboard?.events?.thisMonth ?? 0}
            sub="eventos no mês"
          />
        </div>
      )}

      {completedEvents.length > 0 && (
        <div className="bg-dark-800 border border-dark-border rounded-xl p-5">
          <h2 className="font-display font-bold text-lg tracking-wide text-text-primary mb-4">
            Últimos eventos concluídos
          </h2>
          <div className="space-y-1">
            {completedEvents.map((ev: any) => (
              <Link
                key={ev.id}
                href={`/relatorios/${ev.id}`}
                className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-md hover:bg-dark-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semi font-semibold text-sm text-text-primary truncate">
                    {ev.name}
                  </p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">
                    {formatDate(ev.startDate)} → {formatDate(ev.returnDate)}
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
        </div>
      )}
    </div>
  );
}
