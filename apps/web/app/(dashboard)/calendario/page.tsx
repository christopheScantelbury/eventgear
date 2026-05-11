'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { calendarApi, type CalendarEvent } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type View = 'month' | 'week';

const STATUS_COLORS: Record<string, string> = {
  PLANNED:     'bg-blue-500/20 border-blue-500/40 text-blue-300',
  IN_PROGRESS: 'bg-amber-500/25 border-amber-500/50 text-amber-300',
  COMPLETED:   'bg-status-available/20 border-status-available/40 text-status-available',
  CANCELLED:   'bg-text-muted/15 border-text-muted/30 text-text-muted line-through',
};

export default function CalendarioPage() {
  const [view, setView] = useState<View>('month');
  const [cursor, setCursor] = useState<Date>(() => startOfDay(new Date()));

  const { rangeStart, rangeEnd, days } = useMemo(() => buildRange(cursor, view), [cursor, view]);

  const { data: events, isLoading, isFetching } = useQuery({
    queryKey: ['calendar-events', rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: () => calendarApi.events({ start: rangeStart.toISOString(), end: rangeEnd.toISOString() }),
    // Mantém os dados anteriores visíveis enquanto carrega novo range/view.
    // Evita o flash de skeleton ao trocar entre Mês ↔ Semana.
    placeholderData: keepPreviousData,
  });

  const eventsByDay = useMemo(() => groupEventsByDay(events ?? [], days), [events, days]);

  return (
    <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
            Calendário
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Visualize eventos e detecte conflitos antes de alocar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-dark-800 border border-dark-border rounded-md overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={cn(
                'px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors',
                view === 'month' ? 'bg-amber-500/15 text-amber-400' : 'text-text-secondary hover:bg-dark-700',
              )}
            >
              Mês
            </button>
            <button
              onClick={() => setView('week')}
              className={cn(
                'px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors',
                view === 'week' ? 'bg-amber-500/15 text-amber-400' : 'text-text-secondary hover:bg-dark-700',
              )}
            >
              Semana
            </button>
          </div>
          <Link href="/eventos/novo">
            <Button size="sm">
              <Plus size={14} /> Novo evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor((c) => shift(c, view, -1))}
          className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-dark-800 transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-display text-lg font-bold text-text-primary capitalize">
          {view === 'month'
            ? cursor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
            : `${rangeStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${rangeEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(startOfDay(new Date()))}
            className="text-xs font-mono uppercase tracking-wider text-text-secondary hover:text-text-primary px-2 py-1 transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => setCursor((c) => shift(c, view, 1))}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-dark-800 transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Cabeçalho dos dias */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="text-center text-[10px] font-mono uppercase tracking-wider text-text-muted py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      {isLoading && !events ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className={cn('grid grid-cols-7 gap-1 transition-opacity', view === 'week' ? 'auto-rows-[180px]' : 'auto-rows-[120px]', isFetching && 'opacity-60')}>
          {days.map((day, i) => {
            const isOtherMonth = view === 'month' && day.getMonth() !== cursor.getMonth();
            const isToday = isSameDay(day, new Date());
            const dayEvents = eventsByDay.get(day.toDateString()) ?? [];

            return (
              <div
                key={i}
                className={cn(
                  'bg-dark-800 border rounded-md p-1.5 overflow-hidden flex flex-col gap-0.5',
                  isOtherMonth ? 'border-dark-border/50 opacity-40' : 'border-dark-border',
                  isToday && 'border-amber-500/50',
                )}
              >
                <div className={cn(
                  'text-[11px] font-mono shrink-0',
                  isToday ? 'text-amber-400 font-bold' : 'text-text-muted',
                )}>
                  {day.getDate()}
                </div>
                <div className="flex-1 overflow-y-auto space-y-0.5">
                  {dayEvents.slice(0, view === 'week' ? 8 : 3).map((e) => (
                    <Link
                      key={e.id}
                      href={`/eventos/${e.id}`}
                      title={e.name}
                      className={cn(
                        'block text-[10px] px-1.5 py-0.5 rounded border truncate',
                        STATUS_COLORS[e.status] ?? 'bg-dark-700 text-text-muted',
                      )}
                    >
                      {e.name}
                    </Link>
                  ))}
                  {dayEvents.length > (view === 'week' ? 8 : 3) && (
                    <p className="text-[9px] font-mono text-text-muted px-1">
                      +{dayEvents.length - (view === 'week' ? 8 : 3)} mais
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legenda + lista de eventos próximos */}
      {!isLoading && events && events.length === 0 && (
        <div className="bg-dark-800 border border-dark-border rounded-xl py-12 px-6 text-center mt-6">
          <CalendarIcon size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-muted mb-4">Nenhum evento neste período.</p>
          <Link href="/eventos/novo"><Button size="sm"><Plus size={13} /> Criar evento</Button></Link>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
        <span className="text-text-muted font-mono uppercase tracking-wider">Status:</span>
        {[
          { k: 'PLANNED', l: 'Planejado' },
          { k: 'IN_PROGRESS', l: 'Em andamento' },
          { k: 'COMPLETED', l: 'Concluído' },
          { k: 'CANCELLED', l: 'Cancelado' },
        ].map(({ k, l }) => (
          <span key={k} className={cn('px-2 py-0.5 rounded border text-[10px]', STATUS_COLORS[k])}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function shift(d: Date, view: View, delta: number): Date {
  const x = new Date(d);
  if (view === 'month') {
    x.setMonth(x.getMonth() + delta);
  } else {
    x.setDate(x.getDate() + 7 * delta);
  }
  return x;
}

function buildRange(cursor: Date, view: View) {
  if (view === 'week') {
    const start = startOfDay(cursor);
    start.setDate(start.getDate() - start.getDay()); // domingo
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return { rangeStart: start, rangeEnd: end, days };
  }

  // month: começa no domingo da semana do dia 1, termina no sábado da semana do último dia
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const start = startOfDay(monthStart);
  start.setDate(start.getDate() - start.getDay());
  const end = startOfDay(monthEnd);
  end.setDate(end.getDate() + (6 - end.getDay()));
  end.setHours(23, 59, 59, 999);

  const days: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return { rangeStart: start, rangeEnd: end, days };
}

function groupEventsByDay(events: CalendarEvent[], days: Date[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const day of days) map.set(day.toDateString(), []);
  for (const e of events) {
    const start = startOfDay(new Date(e.startDate));
    const end = startOfDay(new Date(e.returnDate));
    const cur = new Date(start);
    while (cur <= end) {
      const key = cur.toDateString();
      if (map.has(key)) map.get(key)!.push(e);
      cur.setDate(cur.getDate() + 1);
    }
  }
  return map;
}
