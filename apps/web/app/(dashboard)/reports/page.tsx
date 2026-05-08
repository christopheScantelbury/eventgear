'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Package, CalendarDays, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { reportsApi, eventsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function ReportsPage() {
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
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-sm text-gray-500 mt-0.5">Visão geral do uso de equipamentos</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Package size={18} />
              <span className="text-xs font-semibold uppercase tracking-wide">Materiais</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboard?.materials?.total ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">total cadastrados</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 size={18} />
              <span className="text-xs font-semibold uppercase tracking-wide">Disponíveis</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboard?.materials?.available ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">prontos para uso</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <CalendarDays size={18} />
              <span className="text-xs font-semibold uppercase tracking-wide">Eventos</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboard?.events?.total ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">total registrados</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Clock size={18} />
              <span className="text-xs font-semibold uppercase tracking-wide">Em andamento</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboard?.events?.active ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">eventos ativos</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-teal-600 mb-2">
              <TrendingUp size={18} />
              <span className="text-xs font-semibold uppercase tracking-wide">Concluídos</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboard?.events?.completed ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">eventos finalizados</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <BarChart3 size={18} />
              <span className="text-xs font-semibold uppercase tracking-wide">Este mês</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboard?.events?.thisMonth ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">eventos no mês</p>
          </div>
        </div>
      )}

      {/* Eventos recentes concluídos */}
      {completedEvents.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Últimos eventos concluídos</h2>
          <div className="space-y-2">
            {completedEvents.map((ev: any) => (
              <Link
                key={ev.id}
                href={`/dashboard/events/${ev.id}`}
                className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ev.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(ev.startDate)} → {formatDate(ev.returnDate)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{ev.materials?.length ?? 0} itens</span>
                  <Badge variant="success">Concluído</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
