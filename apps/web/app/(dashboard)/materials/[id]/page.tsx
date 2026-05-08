'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Trash2, QrCode, Tag } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';
import { materialsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage, formatCurrency, formatDate, MATERIAL_STATUS_LABELS } from '@/lib/utils';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'purple'> = {
  AVAILABLE: 'success',
  ALLOCATED: 'warning',
  MAINTENANCE: 'purple',
  LOST: 'destructive',
};

function QrCodeCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, { width: 180, margin: 1 });
    }
  }, [value]);
  return <canvas ref={canvasRef} className="rounded-lg" />;
}

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const { toast } = useToast();

  const { data: material, isLoading } = useQuery({
    queryKey: ['materials', id],
    queryFn: () => materialsApi.get(id),
  });

  const { mutate: remove, isPending: removing } = useMutation({
    mutationFn: () => materialsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
      toast('Material removido', 'success');
      router.push('/dashboard/materials');
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!material) return null;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      <Link
        href="/dashboard/materials"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeft size={16} /> Materiais
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{material.name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{material.category}</p>
        </div>
        <Badge variant={STATUS_VARIANT[material.status] ?? 'secondary'}>
          {MATERIAL_STATUS_LABELS[material.status as keyof typeof MATERIAL_STATUS_LABELS]}
        </Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* QR Code */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <QrCode size={16} />
            QR Code
          </div>
          <QrCodeCanvas value={material.qrCode} />
          <p className="text-xs font-mono text-gray-500">{material.qrCode}</p>
        </div>

        {/* Detalhes */}
        <div className="sm:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Tag size={14} /> Informações
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Qtd. total</dt>
              <dd className="font-medium">{material.totalQty}</dd>
            </div>
            {material.brand && (
              <div>
                <dt className="text-gray-500">Marca</dt>
                <dd className="font-medium">{material.brand}</dd>
              </div>
            )}
            {material.model && (
              <div>
                <dt className="text-gray-500">Modelo</dt>
                <dd className="font-medium">{material.model}</dd>
              </div>
            )}
            {material.serialNumber && (
              <div>
                <dt className="text-gray-500">Nº Série</dt>
                <dd className="font-mono text-xs">{material.serialNumber}</dd>
              </div>
            )}
            {material.replaceCost && (
              <div>
                <dt className="text-gray-500">Reposição</dt>
                <dd className="font-medium">{formatCurrency(Number(material.replaceCost))}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Cadastrado</dt>
              <dd className="font-medium">{formatDate(material.createdAt)}</dd>
            </div>
          </dl>
          {material.description && (
            <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{material.description}</p>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800">Zona de perigo</p>
            <p className="text-xs text-red-600 mt-0.5">A remoção é permanente (soft-delete)</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Remover este material?')) remove();
            }}
            disabled={removing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            <Trash2 size={14} />
            Remover
          </button>
        </div>
      )}
    </div>
  );
}
