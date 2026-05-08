'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronLeft, Plus, Trash2, ClipboardCheck, Package } from 'lucide-react';
import Link from 'next/link';
import { eventsApi, materialsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { formatDate, getErrorMessage, STATUS_LABELS } from '@/lib/utils';

const STATUS_VARIANT: Record<string, any> = {
  PLANNED: 'default', IN_PROGRESS: 'warning', COMPLETED: 'success', CANCELLED: 'secondary',
};

export default function EventDetailPage() {
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
      router.push('/dashboard/events');
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-4">
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
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      <Link href="/dashboard/events" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ChevronLeft size={16} /> Eventos
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          {event.client && <p className="text-sm text-gray-500 mt-0.5">Cliente: {event.client}</p>}
        </div>
        <Badge variant={STATUS_VARIANT[event.status]}>{STATUS_LABELS[event.status as keyof typeof STATUS_LABELS]}</Badge>
      </div>

      {/* Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Início</span>
          <p className="font-medium">{formatDate(event.startDate)}</p>
        </div>
        <div>
          <span className="text-gray-500">Retorno</span>
          <p className="font-medium">{formatDate(event.returnDate)}</p>
        </div>
        {event.location && (
          <div>
            <span className="text-gray-500">Local</span>
            <p className="font-medium">{event.location}</p>
          </div>
        )}
        {event.notes && (
          <div className="sm:col-span-2">
            <span className="text-gray-500">Observações</span>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-2 mt-1">{event.notes}</p>
          </div>
        )}
      </div>

      {/* Materiais alocados */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Materiais alocados</h2>
          {canEdit && (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} /> Adicionar
            </button>
          )}
        </div>

        {event.materials?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum material alocado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {event.materials?.map((em: any) => (
              <div key={em.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{em.material.name}</p>
                  <p className="text-xs text-gray-500">{em.material.category} · {em.material.qrCode}</p>
                </div>
                <span className="text-sm font-medium text-gray-700 shrink-0">{em.qtyAllocated} un.</span>
                {canEdit && (
                  <button
                    onClick={() => removeMaterial(em.material.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
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
          <Link
            href={`/dashboard/checklist/${id}/departure`}
            className="flex-1 flex items-center justify-center gap-2 h-11 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ClipboardCheck size={16} />
            Checklist Saída
          </Link>
          {event.status === 'IN_PROGRESS' && (
            <Link
              href={`/dashboard/checklist/${id}/return`}
              className="flex-1 flex items-center justify-center gap-2 h-11 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <ClipboardCheck size={16} />
              Checklist Retorno
            </Link>
          )}
        </div>
      )}

      {canEdit && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-red-800">Cancelar evento</p>
          <button
            onClick={() => { if (confirm('Cancelar este evento?')) cancelEvent(); }}
            disabled={cancelling}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {cancelling && <Spinner className="w-3 h-3" />}
            Cancelar
          </button>
        </div>
      )}

      {/* Dialog adicionar material */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Adicionar material ao evento">
        <div className="space-y-4">
          <div>
            <Label>Material</Label>
            <Select value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
              <option value="">Selecionar...</option>
              {materialsData?.items?.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name} (disponível: {m.totalQty})</option>
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
            <button
              onClick={() => materialId && addMaterial()}
              disabled={!materialId || adding}
              className="flex items-center gap-2 h-11 px-5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {adding && <Spinner className="w-4 h-4" />}
              Adicionar
            </button>
            <button
              onClick={() => setAddOpen(false)}
              className="h-11 px-5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
