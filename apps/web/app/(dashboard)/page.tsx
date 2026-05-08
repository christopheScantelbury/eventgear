'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { reportsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: reportsApi.dashboard,
  });

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do seu inventário</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Package} label="Materiais" value={data?.materials?.total ?? 0} color="bg-blue-50 text-blue-600" />
          <StatCard icon={CheckCircle2} label="Disponíveis" value={data?.materials?.available ?? 0} color="bg-green-50 text-green-600" />
          <StatCard icon={CalendarDays} label="Eventos" value={data?.events?.total ?? 0} color="bg-purple-50 text-purple-600" />
          <StatCard icon={Clock} label="Em andamento" value={data?.events?.active ?? 0} color="bg-orange-50 text-orange-600" />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/materials/new"
          className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <Package size={24} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900">Novo Material</h3>
          <p className="text-sm text-gray-500 mt-0.5">Cadastrar equipamento no inventário</p>
        </Link>

        <Link
          href="/dashboard/events/new"
          className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <CalendarDays size={24} className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-gray-900">Novo Evento</h3>
          <p className="text-sm text-gray-500 mt-0.5">Criar evento e alocar equipamentos</p>
        </Link>
      </div>
    </div>
  );
}
