'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
  open: boolean;
}

const ELEMENT_ID = 'eg-qr-scanner-region';

export function QrScanner({ onScan, onClose, open }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);
    setLastScan(null);
    setIsStarting(true);

    const start = async () => {
      try {
        // Aguarda elemento existir no DOM
        await new Promise((r) => setTimeout(r, 50));
        if (cancelled) return;

        const scanner = new Html5Qrcode(ELEMENT_ID, { verbose: false });
        scannerRef.current = scanner;

        const cameras = await Html5Qrcode.getCameras();
        if (cameras.length === 0) {
          throw new Error('Nenhuma câmera encontrada');
        }

        // Prefere câmera traseira em mobile
        const rearCamera = cameras.find((c) => /back|rear|environment/i.test(c.label)) ?? cameras[cameras.length - 1];

        await scanner.start(
          rearCamera.id,
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          },
          (decoded) => {
            if (cancelled) return;
            setLastScan(decoded);
            // Beep visual feedback
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate?.(50);
            }
            onScan(decoded);
          },
          () => { /* ignora erros de frame (são frequentes) */ },
        );

        setIsStarting(false);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message ?? 'Não foi possível acessar a câmera');
        setIsStarting(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      void (async () => {
        try {
          if (scannerRef.current) {
            const state = scannerRef.current.getState();
            if (state === 2 /* SCANNING */) {
              await scannerRef.current.stop();
            }
            scannerRef.current.clear();
            scannerRef.current = null;
          }
        } catch { /* ignore */ }
      })();
    };
  }, [open, onScan]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-900/80">
        <div className="flex items-center gap-2">
          <Camera size={18} className="text-amber-400" />
          <h2 className="font-display text-lg font-bold text-text-primary">Scanner QR</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-dark-800 transition-colors"
          aria-label="Fechar scanner"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {error ? (
          <div className="max-w-sm text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-status-lost" />
            <p className="text-sm text-text-primary mb-2">Erro ao acessar câmera</p>
            <p className="text-xs text-text-muted mb-4">{error}</p>
            <Button variant="ghost" onClick={onClose}>Fechar</Button>
          </div>
        ) : (
          <>
            <div
              id={ELEMENT_ID}
              className="w-full max-w-sm aspect-square bg-dark-900 rounded-2xl overflow-hidden border-2 border-amber-500/30"
            />
            {isStarting && (
              <p className="text-sm text-text-muted mt-4 animate-pulse">Acessando câmera…</p>
            )}
            {lastScan && !isStarting && (
              <div className="mt-4 flex items-center gap-2 bg-status-available/15 border border-status-available/40 text-status-available px-3 py-2 rounded-lg">
                <Check size={14} />
                <span className="text-xs font-mono">{lastScan}</span>
              </div>
            )}
            {!isStarting && !lastScan && (
              <p className="text-sm text-text-muted mt-4 text-center max-w-xs">
                Aponte para o QR Code do equipamento.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
