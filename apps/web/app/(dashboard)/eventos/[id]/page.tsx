'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronLeft, Plus, Trash2, ClipboardCheck, Package } from 'lucide-react';
import Link from 'next/link';
import { eventsApi, materialsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Dialog } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EventStatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/components/ui/toast';
import { formatDate, getErrorMessage } from '@/lib/utils';

export default function EventoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [materialId, setMaterialId] = useState('');
  const [qty, setQty] = useState(1);

  const { data: event, isLoading } = useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.get(id),
  });

  const { data: materialsData } = useQuery({
    queryKey: ['materials', 'all'],
    queryFn: () => materialsApi.list({ limit: 100 }),
    enabled: addOpen,
  });

  const { mutate: addMaterial, isPending: adding } = useMutation({
    mutationFn: () => eventsApi.addMaterial(id, { materialId, qtyAllocated: qty }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', id] });
      toast('Material adicionado!', 'success');
      setAddOpen(false);
      setMaterialId('');
      setQty(1);
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

  const { mutate: cancelEvent, isPending: cancelling } = useMutation({
    mutationFn: () => eventsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
      toast('Evento cancelado', 'success');
      router.push('/eventos');
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
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
  const canEdit = isAdmin && event.status === 'PLANNED';
  const canChecklist = event.status === 'PLANNED' || event.status === 'IN_PROGRESS';

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <Link
        href="/eventos"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ChevronLeft size={16} /> Eventos
      </Link>

      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary truncate">
            {event.name}
          </h1>
          {event.client && (
            <p className="text-sm text-text-secondary mt-1">Cliente: {event.client}</p>
          )}
        </div>
        <EventStatusBadge status={event.status} />
      </div>

      {/* Info */}
      <div className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-4 grid sm:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
            Início
          </p>
          <p className="font-mono text-sm text-text-primary mt-1">
            {formatDate(event.startDate)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
            Retorno
          </p>
          <p className="font-mono text-sm text-text-primary mt-1">
            {formatDate(event.returnDate)}
          </p>
        </div>
        {event.location && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
              Local
            </p>
            <p className="text-sm font-medium text-text-primary mt-1">{event.location}</p>
          </div>
        )}
        {event.notes && (
          <div className="sm:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
              Observações
            </p>
            <p className="text-sm text-text-secondary bg-dark-900 border border-dark-border rounded-md p-3 mt-1">
              {event.notes}
            </p>
          </div>
        )}
      </div>

      {/* Materiais alocados */}
      <div className="bg-dark-800 border border-dark-border rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg tracking-wide text-text-primary">
            Materiais alocados
          </h2>
          {canEdit && (
            <Button onClick={() => setAddOpen(true)} size="sm">
              <Plus size={14} /> Adicionar
            </Button>
          )}
        </div>

        {event.materials?.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <Package size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum material alocado</p>
          </div>
        ) : (
          <div className="space-y-1">
            {event.materials?.map((em: any) => (
              <div
                key={em.id}
                className="flex items-center gap-3 py-3 border-b border-dark-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semi font-semibold text-sm text-text-primary truncate">
                    {em.material.name}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {em.material.category} ·{' '}
                    <span className="font-mono">{em.material.qrCode}</span>
                  </p>
                </div>
                <span className="font-mono text-sm text-text-primary shrink-0 bg-dark-700 px-2 py-1 rounded-xs">
                  {em.qtyAllocated} un.
                </span>
                {canEdit && (
                  <button
                    onClick={() => removeMaterial(em.material.id)}
                    className="text-text-muted hover:text-status-lost transition-colors shrink-0 p-1"
                    aria-label="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ações */}
      {canChecklist && (
        <div className="flex gap-3 mb-4">
          <Link href={`/eventos/${id}/checklist?tipo=saida`} className="flex-1">
            <Button block size="lg" variant="primary">
              <ClipboardCheck size={16} />
              Checklist Saída
            </Button>
          </Link>
          {event.status === 'IN_PROGRESS' && (
            <Link href={`/eventos/${id}/checklist?tipo=retorno`} className="flex-1">
              <Button block size="lg" variant="success">
                <ClipboardCheck size={16} />
                Checklist Retorno
              </Button>
            </Link>
          )}
        </div>
      )}

      {canEdit && (
        <div className="bg-status-lost/8 border border-status-lost/25 rounded-xl p-4 flex items-center justify-between gap-3">
          <p className="font-semi font-semibold text-status-lost">Cancelar evento</p>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Cancelar este evento?')) cancelEvent();
            }}
            disabled={cancelling}
          >
            {cancelling && <Spinner className="w-3 h-3 text-status-lost" />}
            Cancelar
          </Button>
        </div>
      )}

      {/* Dialog adicionar material */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Adicionar material ao evento"
      >
        <div className="space-y-4">
          <div>
            <Label>Material</Label>
            <Select value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
              <option value="">Selecionar...</option>
              {materialsData?.items?.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name} (disponível: {m.totalQty})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Quantidade</Label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={() => materialId && addMaterial()} disabled={!materialId || adding}>
              {adding && <Spinner className="w-4 h-4 text-dark-900" />}
              Adicionar
            </Button>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
