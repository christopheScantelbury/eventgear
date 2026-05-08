'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Trash2, QrCode, Tag, Pencil } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';
import { materialsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { MaterialStatusBadge } from '@/components/ui/status-badge';
import { Spinner } from '@/components/ui/spinner';
import { getErrorMessage, formatCurrency, formatDate } from '@/lib/utils';

function QrCodeCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 180,
        margin: 1,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      });
    }
  }, [value]);
  return <canvas ref={canvasRef} className="rounded-md" />;
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
      router.push('/materiais');
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!material) return null;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/materiais"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Materiais
        </Link>
        {isAdmin && (
          <Link href={`/materiais/${id}/editar`}>
            <Button size="sm" variant="ghost">
              <Pencil size={14} />
              Editar
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-primary truncate">
            {material.name}
          </h1>
          <p className="font-mono text-xs uppercase tracking-[1.5px] text-amber-600 mt-1">
            {material.category}
          </p>
        </div>
        <MaterialStatusBadge status={material.status} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* QR Code */}
        <div className="bg-dark-800 border border-dark-border rounded-xl p-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
            <QrCode size={14} />
            QR Code
          </div>
          <div className="bg-white p-3 rounded-md">
            <QrCodeCanvas value={material.qrCode} />
          </div>
          <p className="font-mono text-[11px] text-text-secondary break-all text-center">
            {material.qrCode}
          </p>
        </div>

        {/* Detalhes */}
        <div className="sm:col-span-2 bg-dark-800 border border-dark-border rounded-xl p-5">
          <h3 className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted mb-4 flex items-center gap-2">
            <Tag size={12} /> Informações
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
                Qtd. total
              </dt>
              <dd className="font-display text-lg font-bold text-text-primary mt-1">
                {material.totalQty}
              </dd>
            </div>
            {material.brand && (
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
                  Marca
                </dt>
                <dd className="font-medium text-text-primary mt-1">{material.brand}</dd>
              </div>
            )}
            {material.model && (
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
                  Modelo
                </dt>
                <dd className="font-medium text-text-primary mt-1">{material.model}</dd>
              </div>
            )}
            {material.serialNumber && (
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
                  Nº Série
                </dt>
                <dd className="font-mono text-xs text-text-primary mt-1 break-all">
                  {material.serialNumber}
                </dd>
              </div>
            )}
            {material.replaceCost && (
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
                  Reposição
                </dt>
                <dd className="font-mono font-medium text-text-primary mt-1">
                  {formatCurrency(Number(material.replaceCost))}
                </dd>
              </div>
            )}
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-muted">
                Cadastrado
              </dt>
              <dd className="font-mono text-text-primary mt-1">
                {formatDate(material.createdAt)}
              </dd>
            </div>
          </dl>
          {material.description && (
            <p className="mt-5 text-sm text-text-secondary bg-dark-900 border border-dark-border rounded-md p-3">
              {material.description}
            </p>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-status-lost/8 border border-status-lost/25 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-semi font-semibold text-status-lost">Zona de perigo</p>
            <p className="text-xs text-red-200/70 mt-0.5">
              A remoção é permanente (soft-delete).
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Remover este material?')) remove();
            }}
            disabled={removing}
          >
            {removing && <Spinner className="w-3 h-3 text-status-lost" />}
            <Trash2 size={14} />
            Remover
          </Button>
        </div>
      )}
    </div>
  );
}
