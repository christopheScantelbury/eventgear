'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { reportsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: reportsApi.dashboard,
  });

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[2px] text-amber-600 mb-2">
          Bem-vindo
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
          Olá, {user?.name?.split(' ')[0] ?? 'Operador'}
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Visão geral do seu inventário e operações em andamento.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Package} label="Materiais" value={data?.materials?.total ?? 0} sub="total no inventário" />
          <StatCard
            icon={CheckCircle2}
            label="Disponíveis"
            value={data?.materials?.available ?? 0}
            sub="prontos para uso"
            iconClassName="text-status-available"
          />
          <StatCard
            icon={CalendarDays}
            label="Eventos"
            value={data?.events?.total ?? 0}
            sub="total registrados"
            iconClassName="text-status-maintenance"
          />
          <StatCard
            icon={Clock}
            label="Em andamento"
            value={data?.events?.active ?? 0}
            sub="ativos agora"
            iconClassName="text-amber-400"
          />
        </div>
      )}

      <h2 className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-3">
        Ações rápidas
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/dashboard/materials/new"
          className="group bg-dark-800 border border-dark-border rounded-xl p-5 hover:border-amber-700 transition-colors"
        >
          <div className="w-11 h-11 bg-dark-700 border border-dark-border-med rounded-md flex items-center justify-center mb-3 group-hover:border-amber-600 transition-colors">
            <Package size={20} className="text-amber-400" />
          </div>
          <h3 className="font-display text-lg font-bold tracking-wide text-text-primary">
            Novo Material
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Cadastrar equipamento no inventário com QR code automático.
          </p>
        </Link>

        <Link
          href="/dashboard/events/new"
          className="group bg-dark-800 border border-dark-border rounded-xl p-5 hover:border-amber-700 transition-colors"
        >
          <div className="w-11 h-11 bg-dark-700 border border-dark-border-med rounded-md flex items-center justify-center mb-3 group-hover:border-amber-600 transition-colors">
            <CalendarDays size={20} className="text-amber-400" />
          </div>
          <h3 className="font-display text-lg font-bold tracking-wide text-text-primary">
            Novo Evento
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Criar evento, alocar equipamentos e gerar checklist.
          </p>
        </Link>
      </div>
    </div>
  );
}
