'use client';

import Dexie, { type Table } from 'dexie';

// ── Tipos persistidos offline ─────────────────────────────────────
export interface OfflineEvent {
  id: string;
  name: string;
  startDate: string;
  returnDate: string;
  location?: string | null;
  status: string;
  client?: string | null;
  cachedAt: number;
}

export interface OfflineChecklistItem {
  id: string;            // uuid local
  eventId: string;
  type: 'DEPARTURE' | 'RETURN';
  qrCode: string;
  status: 'CONFIRMED' | 'MISSING' | 'DAMAGED';
  notes?: string;
  scannedAt: number;     // timestamp local
}

/**
 * Fila de operações pendentes de sync.
 * Cada item é uma chamada HTTP que deve ser repetida quando online.
 */
export interface PendingOperation {
  id?: number;             // auto-increment
  endpoint: string;        // ex: '/checklist/scan'
  method: 'POST' | 'PATCH' | 'DELETE';
  payload: Record<string, unknown>;
  createdAt: number;
  attempts: number;
  lastError?: string;
}

class EventGearDB extends Dexie {
  events!: Table<OfflineEvent, string>;
  checklistItems!: Table<OfflineChecklistItem, string>;
  pendingOps!: Table<PendingOperation, number>;

  constructor() {
    super('eventgear-offline-v1');
    this.version(1).stores({
      events:         'id, startDate, returnDate, cachedAt',
      checklistItems: 'id, eventId, type, qrCode, scannedAt',
      pendingOps:     '++id, endpoint, createdAt',
    });
  }
}

// Singleton — só inicializa no client
let _db: EventGearDB | null = null;
export function getDb(): EventGearDB {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB only available in browser');
  }
  if (!_db) _db = new EventGearDB();
  return _db;
}

// ── Helpers de alto nível ─────────────────────────────────────────

export async function cacheEventsForOffline(events: OfflineEvent[]) {
  const db = getDb();
  const now = Date.now();
  await db.events.bulkPut(events.map((e) => ({ ...e, cachedAt: now })));
}

export async function getCachedEvents(): Promise<OfflineEvent[]> {
  const db = getDb();
  return db.events.orderBy('startDate').toArray();
}

export async function getCachedEvent(id: string): Promise<OfflineEvent | undefined> {
  const db = getDb();
  return db.events.get(id);
}

export async function recordChecklistScan(item: Omit<OfflineChecklistItem, 'id' | 'scannedAt'>) {
  const db = getDb();
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record: OfflineChecklistItem = { id, scannedAt: Date.now(), ...item };
  await db.checklistItems.put(record);
  return record;
}

export async function getOfflineChecklist(eventId: string, type?: 'DEPARTURE' | 'RETURN') {
  const db = getDb();
  let query = db.checklistItems.where('eventId').equals(eventId);
  const items = await query.toArray();
  return type ? items.filter((i) => i.type === type) : items;
}

export async function enqueueOperation(op: Omit<PendingOperation, 'id' | 'attempts' | 'createdAt'>) {
  const db = getDb();
  await db.pendingOps.add({
    ...op,
    createdAt: Date.now(),
    attempts: 0,
  });
}

export async function getPendingOps(): Promise<PendingOperation[]> {
  const db = getDb();
  return db.pendingOps.orderBy('createdAt').toArray();
}

export async function removePendingOp(id: number) {
  const db = getDb();
  await db.pendingOps.delete(id);
}

export async function markOpFailed(id: number, error: string) {
  const db = getDb();
  const op = await db.pendingOps.get(id);
  if (op) {
    await db.pendingOps.update(id, {
      attempts: op.attempts + 1,
      lastError: error,
    });
  }
}

export async function clearOldCache(olderThanMs = 7 * 24 * 60 * 60 * 1000) {
  const db = getDb();
  const cutoff = Date.now() - olderThanMs;
  await db.events.where('cachedAt').below(cutoff).delete();
}
