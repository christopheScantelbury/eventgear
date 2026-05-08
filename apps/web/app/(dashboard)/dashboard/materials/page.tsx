'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Package, QrCode } from 'lucide-react';
import Link from 'next/link';
import { materialsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MATERIAL_STATUS_LABELS } from '@/lib/utils';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'purple'> = {
  AVAILABLE: 'success',
  ALLOCATED: 'warning',
  MAINTENANCE: 'purple',
  LOST: 'destructive',
};

export default function MaterialsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['materials', page, search],
    queryFn: () => materialsApi.list({ page, limit: 20, search: search || undefined }),
  });

  const materials = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
          <p className="text-sm text-gray-500 mt-0.5">Inventário de equipamentos</p>
        </div>
        {isAdmin && (
          <Link
            href="/dashboard/materials/new"
            className="flex items-center gap-2 h-10 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Novo
          </Link>
        )}
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar materiais..."
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum material encontrado</p>
          {isAdmin && (
            <Link href="/dashboard/materials/new" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
              Cadastrar primeiro material
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {materials.map((m: any) => (
              <Link
                key={m.id}
                href={`/dashboard/materials/${m.id}`}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <Package size={18} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.category} · {m.totalQty} un.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={STATUS_VARIANT[m.status] ?? 'secondary'}>
                    {MATERIAL_STATUS_LABELS[m.status as keyof typeof MATERIAL_STATUS_LABELS] ?? m.status}
                  </Badge>
                  <QrCode size={16} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>

          {meta && meta.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-500">{page} / {meta.pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
