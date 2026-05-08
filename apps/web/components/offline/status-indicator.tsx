'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, CloudUpload, Check } from 'lucide-react';
import { getPendingOps } from '@/lib/offline/db';
import { flushSyncQueue, startBackgroundSync } from '@/lib/offline/sync';
import { cn } from '@/lib/utils';

export function OfflineStatusIndicator() {
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  // Status online/offline
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Background sync
  useEffect(() => {
    return startBackgroundSync();
  }, []);

  // Pendência: poll a cada 5s
  useEffect(() => {
    let mounted = true;
    const update = async () => {
      try {
        const ops = await getPendingOps();
        if (mounted) setPendingCount(ops.length);
      } catch { /* IndexedDB não disponível ainda */ }
    };
    void update();
    const interval = setInterval(update, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  async function manualSync() {
    setSyncing(true);
    try {
      const result = await flushSyncQueue();
      if (result.synced > 0) {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 2500);
      }
      const ops = await getPendingOps();
      setPendingCount(ops.length);
    } finally {
      setSyncing(false);
    }
  }

  // Renderiza apenas quando offline OU quando tem pendências
  if (online && pendingCount === 0 && !justSynced) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50">
      {!online ? (
        <div className="flex items-center gap-2 bg-status-lost/15 border border-status-lost/40 text-status-lost px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
          <WifiOff size={14} />
          <span className="text-xs font-mono uppercase tracking-wider">Offline</span>
          {pendingCount > 0 && (
            <span className="text-[10px] font-bold bg-status-lost/30 px-1.5 py-0.5 rounded">
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      ) : justSynced ? (
        <div className="flex items-center gap-2 bg-status-available/15 border border-status-available/40 text-status-available px-3 py-2 rounded-lg shadow-lg">
          <Check size={14} />
          <span className="text-xs font-mono uppercase tracking-wider">Sincronizado</span>
        </div>
      ) : (
        <button
          onClick={manualSync}
          disabled={syncing}
          className={cn(
            'flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 text-amber-400 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm',
            'hover:bg-amber-500/25 transition-colors',
          )}
        >
          {syncing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono uppercase tracking-wider">Sincronizando…</span>
            </>
          ) : (
            <>
              <CloudUpload size={14} />
              <span className="text-xs font-mono uppercase tracking-wider">
                {pendingCount} para sincronizar
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
