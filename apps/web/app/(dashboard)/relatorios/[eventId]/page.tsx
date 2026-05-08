'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Download, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EventStatusBadge } from '@/components/ui/status-badge';
import { formatDate } from '@/lib/utils';

export default function RelatorioEventoPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ['events', eventId],
    queryFn: () => eventsApi.get(eventId),
  });

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!event) return null;

  const materials = event.materials ?? [];
  const totalAlocados = materials.length;

  function handleDownload() {
    window.open(`/api/relatorios/${eventId}/pdf`, '_blank');
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto pb-28">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/relatorios"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Relatórios
        </Link>
        <Button size="sm" variant="ghost" onClick={handleDownload}>
          <Download size={14} />
          Baixar PDF
        </Button>
      </div>

      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
            {event.name}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {formatDate(event.startDate)} → {formatDate(event.returnDate)}
            {event.location && ` · ${event.location}`}
          </p>
          {event.client && (
            <p className="text-sm text-text-muted mt-0.5">Cliente: {event.client}</p>
          )}
        </div>
        <EventStatusBadge status={event.status} />
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-dark-800 border border-dark-border rounded-xl p-4 text-center">
          <p className="font-display text-2xl font-extrabold text-text-primary">{totalAlocados}</p>
          <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted mt-1">
            Materiais alocados
          </p>
        </div>
        <div className="bg-dark-800 border border-dark-border rounded-xl p-4 text-center">
          <p className="font-display text-2xl font-extrabold text-status-available">{totalAlocados}</p>
          <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted mt-1">
            Confirmados na saída
          </p>
        </div>
        <div className="bg-dark-800 border border-dark-border rounded-xl p-4 text-center col-span-2 sm:col-span-1">
          <p className="font-display text-2xl font-extrabold text-text-primary">{totalAlocados}</p>
          <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted mt-1">
            Retornados
          </p>
        </div>
      </div>

      {/* Tabela de materiais */}
      <div className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-4">
        <h2 className="font-display font-bold text-lg tracking-wide text-text-primary mb-4">
          Materiais
        </h2>
        {materials.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">Nenhum material alocado</p>
        ) : (
          <div className="space-y-1">
            {materials.map((em: any) => (
              <div
                key={em.id}
                className="flex items-center gap-3 py-3 border-b border-dark-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semi font-semibold text-sm text-text-primary truncate">
                    {em.material?.name}
                  </p>
                  <p className="font-mono text-xs text-text-muted">
                    {em.material?.category} · {em.qtyAllocated} un.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pendências */}
      <div className="bg-status-lost/8 border border-status-lost/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-status-lost mt-0.5 shrink-0" />
        <p className="text-sm text-text-secondary">
          Relatório detalhado disponível após conclusão do checklist de retorno.
        </p>
      </div>

      {/* Botão fixo */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-dark-900 border-t border-dark-border md:static md:bg-transparent md:border-0 md:p-0 md:mt-6">
        <Button block size="lg" onClick={handleDownload}>
          <Download size={16} />
          Baixar PDF completo
        </Button>
      </div>
    </div>
  );
}
