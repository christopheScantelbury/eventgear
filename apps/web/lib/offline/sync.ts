'use client';

import { api } from '@/lib/api';
import { getPendingOps, removePendingOp, markOpFailed } from './db';

let syncing = false;

/**
 * Processa fila de operações pendentes.
 * - Tenta cada uma; em caso de erro de rede, mantém na fila.
 * - Em caso de erro 4xx (validation/conflict), remove (não vai resolver tentando de novo).
 */
export async function flushSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (syncing || typeof navigator === 'undefined' || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }
  syncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const ops = await getPendingOps();
    for (const op of ops) {
      try {
        await api.request({
          url: op.endpoint,
          method: op.method,
          data: op.payload,
        });
        await removePendingOp(op.id!);
        synced++;
      } catch (e) {
        const err = e as { response?: { status?: number }; message?: string };
        const status = err.response?.status;
        if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
          // Erro do client → não tentar mais
          await removePendingOp(op.id!);
        } else {
          await markOpFailed(op.id!, err.message ?? 'unknown');
        }
        failed++;
      }
    }
  } finally {
    syncing = false;
  }
  return { synced, failed };
}

/** Registra listeners para sync automático ao voltar online */
export function startBackgroundSync() {
  if (typeof window === 'undefined') return;

  const trigger = () => { void flushSyncQueue(); };

  window.addEventListener('online', trigger);

  // Tenta a cada 30s se estiver online
  const interval = window.setInterval(() => {
    if (navigator.onLine) trigger();
  }, 30_000);

  // Tenta uma vez no boot
  if (navigator.onLine) setTimeout(trigger, 2000);

  // Service worker pede sync via mensagem
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'EG_SYNC_REQUEST') trigger();
    });
  }

  return () => {
    window.removeEventListener('online', trigger);
    window.clearInterval(interval);
  };
}
