'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronLeft, Search, Plus, Minus, Package } from 'lucide-react';
import Link from 'next/link';
import { eventsApi, materialsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/utils';

export default function AlocarMateriaisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [pendingAdd, setPendingAdd] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.get(id),
  });

  const { data: materialsData } = useQuery({
    queryKey: ['materials', 'all', search],
    queryFn: () => materialsApi.list({ limit: 50, search: search || undefined }),
  });

  const { mutate: addMaterial, isPending: adding } = useMutation({
    mutationFn: ({ materialId, qtyAllocated }: { materialId: string; qtyAllocated: number }) =>
      eventsApi.addMaterial(id, { materialId, qtyAllocated }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', id] });
      toast('Material adicionado!', 'success');
      setPendingAdd(null);
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  const { mutate: removeMaterial } = useMutation({
    mutationFn: (mid: string) => eventsApi.removeMaterial(id, mid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', id] });
      toast('Material removido', 'success');
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  if (loadingEvent) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const allocatedIds = new Set(event?.materials?.map((em: any) => em.material.id) ?? []);

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto pb-28">
      <Link
        href={`/eventos/${id}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-2 transition-colors"
      >
        <ChevronLeft size={16} /> {event?.name ?? 'Evento'}
      </Link>

      <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary mb-1">
        Alocar Materiais
      </h1>
      <p className="text-sm text-text-secondary mb-6">{event?.name}</p>

      {/* Materiais já alocados */}
      {event?.materials && event.materials.length > 0 && (
        <div className="mb-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-3">
            Alocados ({event.materials.length})
          </h2>
          <div className="space-y-2">
            {event.materials.map((em: any) => (
              <div
                key={em.id}
                className="flex items-center gap-3 bg-dark-800 border border-dark-border rounded-xl px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semi font-semibold text-sm text-text-primary truncate">
                    {em.material.name}
                  </p>
                  <p className="font-mono text-xs text-text-muted">{em.material.category}</p>
                </div>
                <span className="font-mono text-sm text-text-primary bg-dark-700 px-2 py-1 rounded-xs">
                  {em.qtyAllocated} un.
                </span>
                <button
                  onClick={() => removeMaterial(em.material.id)}
                  className="text-text-muted hover:text-status-lost transition-colors p-1 shrink-0"
                  aria-label="Remover"
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adicionar materiais */}
      <div>
        <h2 className="font-mono text-[10px] uppercase tracking-[2px] text-text-muted mb-3">
          Adicionar do inventário
        </h2>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <Input
            placeholder="Buscar materiais..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {materialsData?.items
            ?.filter((m: any) => !allocatedIds.has(m.id))
            .map((m: any) => (
              <div
                key={m.id}
                className="bg-dark-800 border border-dark-border rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 bg-dark-700 border border-dark-border-med rounded-md flex items-center justify-center shrink-0">
                    <Package size={15} className="text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semi font-semibold text-sm text-text-primary truncate">
                      {m.name}
                    </p>
                    <p className="font-mono text-xs text-text-muted">
                      {m.category} · disponível: {m.totalQty} un.
                    </p>
                  </div>
                  <button
                    onClick={() => setPendingAdd(pendingAdd === m.id ? null : m.id)}
                    className="text-amber-400 hover:text-amber-300 transition-colors p-1 shrink-0"
                    aria-label="Adicionar"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {pendingAdd === m.id && (
                  <div className="border-t border-dark-border px-4 py-3 bg-dark-900 flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={m.totalQty}
                      value={qty[m.id] ?? 1}
                      onChange={(e) => setQty((q) => ({ ...q, [m.id]: Number(e.target.value) }))}
                      className="w-24"
                    />
                    <span className="text-sm text-text-muted">unidades</span>
                    <Button
                      size="sm"
                      onClick={() =>
                        addMaterial({ materialId: m.id, qtyAllocated: qty[m.id] ?? 1 })
                      }
                      disabled={adding}
                    >
                      {adding && <Spinner className="w-3 h-3" />}
                      Adicionar
                    </Button>
                    <button
                      onClick={() => setPendingAdd(null)}
                      className="text-text-muted hover:text-text-primary transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Botão fixo */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-dark-900 border-t border-dark-border md:static md:bg-transparent md:border-0 md:p-0 md:mt-6">
        <Link href={`/eventos/${id}`}>
          <Button block size="lg">
            Concluir alocação
          </Button>
        </Link>
      </div>
    </div>
  );
}
