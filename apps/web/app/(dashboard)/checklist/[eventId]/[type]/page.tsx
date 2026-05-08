'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, QrCode, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { checklistApi, eventsApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { getErrorMessage } from '@/lib/utils';

const TYPE_LABEL = { departure: 'Saída', return: 'Retorno' } as const;
const TYPE_API = { departure: 'DEPARTURE', return: 'RETURN' } as const;

const ITEM_STATUS_VARIANT: Record<string, any> = {
  PENDING: 'secondary',
  CONFIRMED: 'success',
  MISSING: 'destructive',
  DAMAGED: 'warning',
};
const ITEM_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  MISSING: 'Ausente',
  DAMAGED: 'Avariado',
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
  const [generated, setGenerated] = useState(false);

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
      setGenerated(true);
      refetch();
      toast('Checklist gerado!', 'success');
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  const { mutate: scan, isPending: scanning } = useMutation({
    mutationFn: (qrCode: string) => checklistApi.scan({ qrCode, eventId, type: apiType }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['checklist', eventId, type] });
      toast(`✓ ${result.material?.name ?? 'Item'} confirmado!`, 'success');
      setScanMode(false);
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  const allItems = Array.isArray(items) ? items : [];
  const confirmed = allItems.filter((i: any) => i.status === 'CONFIRMED').length;
  const total = allItems.length;
  const progress = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <Link
        href={`/dashboard/events/${eventId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeft size={16} /> {event?.name ?? 'Evento'}
      </Link>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Checklist de {TYPE_LABEL[type] ?? type}
        </h1>
        <button onClick={() => refetch()} className="text-gray-400 hover:text-gray-600 p-1">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">{confirmed} de {total} confirmados</span>
            <span className="font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
              <CheckCircle2 size={14} /> Checklist completo!
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : total === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <AlertCircle size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-700 mb-1">Checklist não gerado</p>
          <p className="text-sm text-gray-500 mb-4">Gere o checklist para listar os materiais</p>
          <button
            onClick={() => generate()}
            disabled={generating}
            className="flex items-center gap-2 mx-auto px-5 h-11 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {generating && <Spinner className="w-4 h-4" />}
            Gerar checklist
          </button>
        </div>
      ) : (
        <>
          {/* Scanner button */}
          <button
            onClick={() => setScanMode(!scanMode)}
            className="w-full flex items-center justify-center gap-2 h-11 mb-4 border-2 border-dashed border-blue-300 text-blue-600 font-medium text-sm rounded-xl hover:bg-blue-50 transition-colors"
          >
            <QrCode size={18} />
            {scanMode ? 'Fechar scanner' : 'Escanear QR Code'}
          </button>

          {/* QR scanner inline */}
          {scanMode && (
            <div className="mb-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
              {scanning ? (
                <div className="flex items-center justify-center h-40">
                  <Spinner className="w-8 h-8 text-blue-500" />
                </div>
              ) : (
                <QrScanner onScan={(code) => scan(code)} />
              )}
            </div>
          )}

          {/* Items list */}
          <div className="space-y-2">
            {allItems.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.eventMaterial?.material?.name ?? 'Material'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {item.eventMaterial?.material?.qrCode}
                  </p>
                </div>
                <Badge variant={ITEM_STATUS_VARIANT[item.status] ?? 'secondary'}>
                  {ITEM_STATUS_LABEL[item.status] ?? item.status}
                </Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
