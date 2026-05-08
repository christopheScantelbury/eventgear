'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Package, QrCode } from 'lucide-react';
import Link from 'next/link';
import { materialsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MaterialStatusBadge } from '@/components/ui/status-badge';

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
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
            Materiais
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Inventário de equipamentos da operação.
          </p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/materials/new">
            <Button size="md" variant="primary">
              <Plus size={16} />
              Novo
            </Button>
          </Link>
        )}
      </div>

      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <Input
          placeholder="Buscar materiais..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-16 text-text-muted bg-dark-800 border border-dark-border rounded-xl">
          <Package size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-display font-bold text-lg tracking-wide text-text-secondary">
            Nenhum material encontrado
          </p>
          {isAdmin && (
            <Link
              href="/dashboard/materials/new"
              className="mt-3 inline-block text-sm text-amber-400 hover:text-amber-300 font-medium"
            >
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
                className="flex items-center gap-4 bg-dark-800 border border-dark-border rounded-xl px-4 py-3 hover:border-dark-border-med transition-colors"
              >
                <div className="w-11 h-11 bg-dark-700 border border-dark-border-med rounded-md flex items-center justify-center shrink-0">
                  <Package size={18} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semi font-semibold text-text-primary truncate">
                    {m.name}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {m.category} ·{' '}
                    <span className="font-mono">{m.totalQty} un.</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <MaterialStatusBadge status={m.status} />
                  <QrCode size={16} className="text-text-muted hidden sm:block" />
                </div>
              </Link>
            ))}
          </div>

          {meta && meta.pages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="font-mono text-xs text-text-secondary">
                {page} / {meta.pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
