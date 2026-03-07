import Dexie, { Table } from 'dexie';

export interface OfflineSession {
  id: string;
  trainer_id: string;
  class_id: string;
  check_in_time: string;
  check_out_time?: string;
  duration_minutes?: number;
  status: 'active' | 'completed';
  synced: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfflineNote {
  id: string;
  session_id: string;
  note_text: string;
  created_by: string;
  synced: boolean;
  created_at: string;
}

export interface SyncQueueItem {
  id?: number;
  entity: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retries: number;
}

class AttendanceDB extends Dexie {
  sessions!: Table<OfflineSession, string>;
  notes!: Table<OfflineNote, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('AttendanceDB');

    this.version(1).stores({
      sessions: 'id, trainer_id, class_id, status, synced, check_in_time',
      notes: 'id, session_id, created_by, synced',
      syncQueue: '++id, entity, action, timestamp',
    });
  }
}

export const db = new AttendanceDB();

// Queue an operation for syncing
export async function queueSyncOperation(entity: string, action: 'create' | 'update' | 'delete', data: any) {
  await db.syncQueue.add({
    entity,
    action,
    data,
    timestamp: new Date().toISOString(),
    retries: 0,
  });
}

// Get all pending sync operations
export async function getPendingSyncOps() {
  return db.syncQueue.toArray();
}

// Clear synced operations
export async function clearSyncedOps(ids: number[]) {
  await db.syncQueue.bulkDelete(ids);
}

// Get pending count
export async function getPendingCount() {
  return db.syncQueue.count();
}
