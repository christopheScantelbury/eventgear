'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Check,
  Clock,
  X as XIcon,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { checklistApi, eventsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { BtnQr } from '@/components/ui/btn-qr';
import { ChecklistItemBadge } from '@/components/ui/status-badge';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage, cn } from '@/lib/utils';

const TYPE_LABEL = { departure: 'Saída', return: 'Retorno' } as const;
const TYPE_API = { departure: 'DEPARTURE', return: 'RETURN' } as const;

const ITEM_ICON_MAP: Record<string, { icon: typeof Check; bg: string; color: string }> = {
  CONFIRMED: { icon: Check, bg: 'bg-status-available/12', color: 'text-status-available' },
  PENDING: { icon: Clock, bg: 'bg-dark-700', color: 'text-text-muted' },
  MISSING: { icon: XIcon, bg: 'bg-status-lost/12', color: 'text-status-lost' },
  DAMAGED: { icon: AlertTriangle, bg: 'bg-status-allocated/12', color: 'text-status-allocated' },
};

function QrScanner({ onScan }: { onScan: (code: string) => void }) {
  const divRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (!divRef.current) return;
    let stopped = false;

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (stopped) return;
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false,
      );
      scannerRef.current = scanner;
      scanner.render(
        (code: string) => {
          scanner.clear();
          onScan(code.trim());
        },
        () => {},
      );
    });

    return () => {
      stopped = true;
      scannerRef.current?.clear().catch(() => {});
    };
  }, [onScan]);

  return <div id="qr-reader" ref={divRef} className="w-full" />;
}

export default function ChecklistPage() {
  const { eventId, type } = useParams<{ eventId: string; type: 'departure' | 'return' }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const apiType = TYPE_API[type] ?? 'DEPARTURE';
  const [scanMode, setScanMode] = useState(false);

  const { data: event } = useQuery({
    queryKey: ['events', eventId],
    queryFn: () => eventsApi.get(eventId),
  });

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['checklist', eventId, type],
    queryFn: () => checklistApi.getItems(eventId, apiType),
  });

  const { mutate: generate, isPending: generating } = useMutation({
    mutationFn: () => checklistApi.generate(eventId, apiType),
    onSuccess: () => {
      refetch();
      toast('Checklist gerado!', 'success');
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  const { mutate: scan, isPending: scanning } = useMutation({
    mutationFn: (qrCode: string) => checklistApi.scan({ qrCode, eventId, type: apiType }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['checklist', eventId, type] });
      toast(`${result.material?.name ?? 'Item'} confirmado`, 'success');
      setScanMode(false);
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  const allItems = Array.isArray(items) ? items : [];
  const confirmed = allItems.filter((i: any) => i.status === 'CONFIRMED').length;
  const total = allItems.length;
  const progress = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto">
      <Link
        href={`/dashboard/events/${eventId}`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ChevronLeft size={16} /> {event?.name ?? 'Evento'}
      </Link>

      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[2px] text-amber-600 mb-1">
            Checklist · {TYPE_LABEL[type] ?? type}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            {TYPE_LABEL[type] ?? type}
          </h1>
        </div>
        <button
          onClick={() => refetch()}
          className="text-text-muted hover:text-text-primary p-2 rounded-md hover:bg-dark-800 transition-colors"
          aria-label="Recarregar"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="bg-dark-800 border border-dark-border rounded-xl p-4 mb-4">
          <div className="flex justify-between items-baseline mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-text-muted">
              <span className="text-text-primary font-medium">{confirmed}</span> de{' '}
              <span className="text-text-primary font-medium">{total}</span> confirmados
            </span>
            <span className="font-display text-2xl font-extrabold text-amber-500 leading-none">
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-dark-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="mt-3 text-sm text-status-available font-medium flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Checklist completo
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="bg-dark-800 border border-dark-border rounded-xl p-8 text-center">
          <AlertCircle size={36} className="mx-auto mb-3 text-text-muted" />
          <p className="font-display font-bold text-lg tracking-wide text-text-primary mb-1">
            Checklist não gerado
          </p>
          <p className="text-sm text-text-secondary mb-5">
            Gere o checklist para listar os materiais alocados.
          </p>
          <Button onClick={() => generate()} disabled={generating} className="mx-auto">
            {generating && <Spinner className="w-4 h-4 text-dark-900" />}
            Gerar checklist
          </Button>
        </div>
      ) : (
        <>
          {/* Scanner toggle */}
          <BtnQr
            onClick={() => setScanMode(!scanMode)}
            className="w-full mb-4"
            label={scanMode ? 'Fechar scanner' : 'Escanear QR Code'}
          >
            {scanMode ? 'Fechar scanner' : 'Escanear QR Code'}
          </BtnQr>

          {/* QR scanner inline */}
          {scanMode && (
            <div className="mb-4 bg-dark-950 border border-dark-border rounded-xl overflow-hidden p-4">
              {scanning ? (
                <div className="flex items-center justify-center h-40">
                  <Spinner className="w-8 h-8 text-amber-500" />
                </div>
              ) : (
                <QrScanner onScan={(code) => scan(code)} />
              )}
            </div>
          )}

          {/* Items list */}
          <div className="space-y-2">
            {allItems.map((item: any) => {
              const cfg = ITEM_ICON_MAP[item.status] ?? ITEM_ICON_MAP.PENDING;
              const Icon = cfg.icon;
              return (
                <div
                  key={item.id}
                  className={cn(
                    'min-h-12 flex items-center gap-3 bg-dark-800 border border-dark-border rounded-lg px-4 py-3',
                    'transition-colors',
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-md flex items-center justify-center shrink-0',
                      cfg.bg,
                    )}
                  >
                    <Icon size={16} className={cfg.color} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semi font-semibold text-sm text-text-primary truncate">
                      {item.eventMaterial?.material?.name ?? 'Material'}
                    </p>
                    <p className="font-mono text-[11px] text-text-muted mt-0.5 truncate">
                      {item.eventMaterial?.material?.qrCode}
                    </p>
                  </div>
                  <ChecklistItemBadge status={item.status} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
