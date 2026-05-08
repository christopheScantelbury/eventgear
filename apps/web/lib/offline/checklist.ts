'use client';

import { api, checklistApi } from '@/lib/api';
import { enqueueOperation, recordChecklistScan, type OfflineChecklistItem } from './db';

/**
 * Registra um scan de checklist.
 * - Online: chama a API direto.
 * - Offline: salva no IndexedDB e enfileira a operação para sync.
 */
export async function scanChecklistItem(params: {
  qrCode: string;
  eventId: string;
  type: 'DEPARTURE' | 'RETURN';
  status?: 'CONFIRMED' | 'MISSING' | 'DAMAGED';
  notes?: string;
}): Promise<{ offline: boolean; result: OfflineChecklistItem | unknown }> {
  const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
  const status = params.status ?? 'CONFIRMED';

  if (isOnline) {
    try {
      const result = await checklistApi.scan({
        qrCode: params.qrCode,
        eventId: params.eventId,
        type: params.type,
      });
      return { offline: false, result };
    } catch (e) {
      // Se falhar por rede, cai pro offline
      const err = e as { code?: string; message?: string };
      if (err.code === 'ERR_NETWORK' || /network/i.test(err.message ?? '')) {
        return saveOffline(params, status);
      }
      throw e;
    }
  }

  return saveOffline(params, status);
}

async function saveOffline(
  params: { qrCode: string; eventId: string; type: 'DEPARTURE' | 'RETURN'; notes?: string },
  status: 'CONFIRMED' | 'MISSING' | 'DAMAGED',
) {
  const record = await recordChecklistScan({
    qrCode: params.qrCode,
    eventId: params.eventId,
    type: params.type,
    status,
    notes: params.notes,
  });

  await enqueueOperation({
    endpoint: '/checklist/scan',
    method: 'POST',
    payload: {
      qrCode: params.qrCode,
      eventId: params.eventId,
      type: params.type,
    },
  });

  return { offline: true, result: record };
}
