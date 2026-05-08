'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Package,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ClipboardCheck,
  ChevronRight,
  Zap,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { reportsApi, eventsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Skeleton } from '@/components/ui/skeleton';
import { EventStatusBadge } from '@/components/ui/status-badge';
import { formatDate, cn } from '@/lib/utils';

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const STATUS_BAR: Record<string, string> = {
  PLANNED: 'bg-dark-border-med',
  IN_PROGRESS: 'bg-amber-500',
  COMPLETED: 'bg-status-available',
  CANCELLED: 'bg-text-muted',
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: reportsApi.dashboard,
  });

  const { data: activeEventsData, isLoading: loadingEvents } = useQuery({
    queryKey: ['events', 'active'],
    queryFn: () => eventsApi.list({ status: 'IN_PROGRESS', limit: 3 }),
  });

  const activeEvents = activeEventsData?.items ?? [];
  const firstName = user?.name?.split(' ')[0] ?? 'Operador';
  const pendencias = (data?.materials?.allocated ?? 0) > 0 ? data?.materials?.allocated : 0;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto space-y-8">

      {/* ── Cabeçalho ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[2px] text-amber-600 mb-1">
            {saudacao()} 👋
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
            {firstName}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Aqui está o resumo de hoje do seu inventário.
          </p>
        </div>
        {/* Ações rápidas desktop */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link
            href="/materiais/novo"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-800 border border-dark-border text-sm font-medium text-text-secondary hover:text-text-primary hover:border-amber-700 transition-colors"
          >
            <Package size={14} className="text-amber-400" />
            Novo material
          </Link>
          <Link
            href="/eventos/novo"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-dark-900 text-sm font-bold hover:bg-amber-400 transition-colors"
          >
            <Plus size={14} />
            Novo evento
          </Link>
        </div>
      </div>

      {/* ── Cards de métricas ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total materiais */}
          <div className="bg-dark-800 border border-dark-border rounded-xl p-4 hover:border-dark-border-med transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[9px] uppercase tracking-[1.5px] text-text-muted">
                Materiais
              </p>
              <span className="w-7 h-7 bg-dark-700 border border-dark-border-med rounded-md flex items-center justify-center">
                <Package size={14} className="text-amber-400" />
              </span>
            </div>
            <p className="font-display text-3xl font-extrabold text-text-primary leading-none">
              {data?.materials?.total ?? 0}
            </p>
            <p className="text-xs text-text-muted mt-1.5">itens no inventário</p>
          </div>

          {/* Disponíveis */}
          <div className="bg-dark-800 border border-dark-border rounded-xl p-4 hover:border-dark-border-med transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[9px] uppercase tracking-[1.5px] text-text-muted">
                Disponíveis
              </p>
              <span className="w-7 h-7 bg-status-available/10 border border-status-available/20 rounded-md flex items-center justify-center">
                <CheckCircle2 size={14} className="text-status-available" />
              </span>
            </div>
            <p className="font-display text-3xl font-extrabold text-status-available leading-none">
              {data?.materials?.available ?? 0}
            </p>
            <p className="text-xs text-text-muted mt-1.5">prontos para uso</p>
          </div>

          {/* Eventos este mês */}
          <div className="bg-dark-800 border border-dark-border rounded-xl p-4 hover:border-dark-border-med transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[9px] uppercase tracking-[1.5px] text-text-muted">
                Este mês
              </p>
              <span className="w-7 h-7 bg-dark-700 border border-dark-border-med rounded-md flex items-center justify-center">
                <CalendarDays size={14} className="text-amber-400" />
              </span>
            </div>
            <p className="font-display text-3xl font-extrabold text-text-primary leading-none">
              {data?.events?.thisMonth ?? 0}
            </p>
            <p className="text-xs text-text-muted mt-1.5">eventos realizados</p>
          </div>

          {/* Pendências */}
          <div className={cn(
            'bg-dark-800 border rounded-xl p-4 transition-colors',
            pendencias > 0
              ? 'border-status-lost/30 hover:border-status-lost/50'
              : 'border-dark-border hover:border-dark-border-med',
          )}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[9px] uppercase tracking-[1.5px] text-text-muted">
                Pendências
              </p>
              <span className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center',
                pendencias > 0
                  ? 'bg-status-lost/10 border border-status-lost/25'
                  : 'bg-dark-700 border border-dark-border-med',
              )}>
                <AlertTriangle size={14} className={pendencias > 0 ? 'text-status-lost' : 'text-text-muted'} />
              </span>
            </div>
            <p className={cn(
              'font-display text-3xl font-extrabold leading-none',
              pendencias > 0 ? 'text-status-lost' : 'text-text-primary',
            )}>
              {data?.events?.active ?? 0}
            </p>
            <p className="text-xs text-text-muted mt-1.5">eventos em andamento</p>
          </div>
        </div>
      )}

      {/* ── Eventos em andamento ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted">
            Eventos ativos
          </h2>
          <Link
            href="/eventos"
            className="flex items-center gap-0.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Ver todos <ChevronRight size={13} />
          </Link>
        </div>

        {loadingEvents ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="bg-dark-800 border border-dark-border rounded-xl px-5 py-8 text-center">
            <CalendarDays size={28} className="mx-auto mb-2 text-text-muted opacity-40" />
            <p className="text-sm font-medium text-text-secondary">Nenhum evento ativo no momento</p>
            <Link
              href="/eventos/novo"
              className="mt-2 inline-block text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Criar evento →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {activeEvents.map((ev: any) => {
              const confirmed = ev.checklistDeparture?.confirmed ?? 0;
              const total = ev.materials?.length ?? 0;
              const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

              return (
                <Link
                  key={ev.id}
                  href={`/eventos/${ev.id}`}
                  className="group relative flex items-center gap-4 bg-dark-800 border border-dark-border rounded-xl px-4 py-3.5 hover:border-amber-700/50 transition-colors overflow-hidden"
                >
                  <span className={cn('absolute top-0 left-0 right-0 h-[3px]', STATUS_BAR[ev.status] ?? 'bg-dark-border-med')} />
                  <div className="w-10 h-10 bg-dark-700 border border-dark-border-med rounded-md flex items-center justify-center shrink-0">
                    <CalendarDays size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-text-primary truncate">
                      {ev.name}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      <span className="font-mono">{formatDate(ev.startDate)}</span>
                      {ev.location && ` · ${ev.location}`}
                    </p>
                    {total > 0 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-dark-950 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-text-muted shrink-0">{confirmed}/{total}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <EventStatusBadge status={ev.status} />
                    <ChevronRight size={14} className="text-text-muted group-hover:text-text-secondary transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Acesso rápido ── */}
      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-3">
          Acesso rápido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/materiais/novo"
            className="group bg-dark-800 border border-dark-border rounded-xl p-4 hover:border-amber-700/60 transition-colors flex flex-col items-start gap-3"
          >
            <span className="w-9 h-9 bg-dark-700 border border-dark-border-med group-hover:border-amber-700 rounded-md flex items-center justify-center transition-colors">
              <Package size={16} className="text-amber-400" />
            </span>
            <div>
              <p className="font-semi font-semibold text-sm text-text-primary">Novo material</p>
              <p className="text-xs text-text-muted mt-0.5">Cadastrar equipamento</p>
            </div>
          </Link>

          <Link
            href="/eventos/novo"
            className="group bg-dark-800 border border-dark-border rounded-xl p-4 hover:border-amber-700/60 transition-colors flex flex-col items-start gap-3"
          >
            <span className="w-9 h-9 bg-dark-700 border border-dark-border-med group-hover:border-amber-700 rounded-md flex items-center justify-center transition-colors">
              <CalendarDays size={16} className="text-amber-400" />
            </span>
            <div>
              <p className="font-semi font-semibold text-sm text-text-primary">Novo evento</p>
              <p className="text-xs text-text-muted mt-0.5">Criar e alocar itens</p>
            </div>
          </Link>

          <Link
            href="/materiais"
            className="group bg-dark-800 border border-dark-border rounded-xl p-4 hover:border-amber-700/60 transition-colors flex flex-col items-start gap-3"
          >
            <span className="w-9 h-9 bg-dark-700 border border-dark-border-med group-hover:border-amber-700 rounded-md flex items-center justify-center transition-colors">
              <QrCode size={16} className="text-amber-400" />
            </span>
            <div>
              <p className="font-semi font-semibold text-sm text-text-primary">Inventário</p>
              <p className="text-xs text-text-muted mt-0.5">Ver todos os itens</p>
            </div>
          </Link>

          <Link
            href="/relatorios"
            className="group bg-dark-800 border border-dark-border rounded-xl p-4 hover:border-amber-700/60 transition-colors flex flex-col items-start gap-3"
          >
            <span className="w-9 h-9 bg-dark-700 border border-dark-border-med group-hover:border-amber-700 rounded-md flex items-center justify-center transition-colors">
              <Zap size={16} className="text-amber-400" />
            </span>
            <div>
              <p className="font-semi font-semibold text-sm text-text-primary">Relatórios</p>
              <p className="text-xs text-text-muted mt-0.5">Estatísticas gerais</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Como funciona (primeiro acesso sem dados) ── */}
      {!isLoading && (data?.materials?.total ?? 0) === 0 && (data?.events?.total ?? 0) === 0 && (
        <section className="bg-gradient-to-br from-amber-500/8 to-dark-800 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-amber-400" />
            <h2 className="font-display font-bold text-lg tracking-wide text-text-primary">
              Bem-vindo ao EventGear!
            </h2>
          </div>
          <p className="text-sm text-text-secondary mb-5">
            Comece em 3 passos simples para ter controle total dos seus equipamentos de evento.
          </p>
          <ol className="space-y-3">
            {[
              { n: '1', icon: Package, label: 'Cadastre seus materiais', desc: 'Adicione equipamentos ao inventário. O QR code é gerado automaticamente.', href: '/materiais/novo', cta: 'Cadastrar material' },
              { n: '2', icon: CalendarDays, label: 'Crie um evento', desc: 'Defina datas, local e aloque os materiais que serão utilizados.', href: '/eventos/novo', cta: 'Criar evento' },
              { n: '3', icon: ClipboardCheck, label: 'Faça o checklist', desc: 'Escaneie os QR codes na saída e no retorno para confirmar cada item.', href: '/eventos', cta: 'Ver eventos' },
            ].map(({ n, icon: Icon, label, desc, href, cta }) => (
              <li key={n} className="flex items-start gap-4">
                <span className="w-7 h-7 bg-amber-500 text-dark-900 rounded-full flex items-center justify-center font-display font-extrabold text-sm shrink-0 mt-0.5">
                  {n}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semi font-semibold text-sm text-text-primary">{label}</p>
                  <p className="text-xs text-text-muted mt-0.5 mb-1.5">{desc}</p>
                  <Link href={href} className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors">
                    {cta} <ChevronRight size={12} />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

    </div>
  );
}
