import { db, getPendingSyncOps, clearSyncedOps, getPendingCount } from './db';
import { syncApi } from './api';

export type SyncState = 'idle' | 'syncing' | 'error';

interface SyncResult {
  synced: number;
  errors: number;
  state: SyncState;
}

export class SyncEngine {
  private syncInProgress = false;
  private onStateChange: ((state: SyncState, pendingCount: number) => void) | null = null;

  setStateChangeHandler(handler: (state: SyncState, pendingCount: number) => void) {
    this.onStateChange = handler;
  }

  async sync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { synced: 0, errors: 0, state: 'syncing' };
    }

    if (!navigator.onLine) {
      return { synced: 0, errors: 0, state: 'idle' };
    }

    this.syncInProgress = true;
    this.notifyState('syncing');

    try {
      const pendingOps = await getPendingSyncOps();
      if (pendingOps.length === 0) {
        this.notifyState('idle');
        return { synced: 0, errors: 0, state: 'idle' };
      }

      const changes = pendingOps.map(op => ({
        entity: op.entity,
        action: op.action,
        data: op.data,
        timestamp: op.timestamp,
      }));

      const response = await syncApi.sync(changes);
      const result = response.data.data;

      // Clear successfully synced operations
      const syncedIds = pendingOps
        .filter((_, i) => !result.errors.find((e: any) => JSON.stringify(e.data) === JSON.stringify(changes[i].data)))
        .map(op => op.id!)
        .filter(Boolean);

      if (syncedIds.length > 0) {
        await clearSyncedOps(syncedIds);
      }

      // Mark local records as synced
      for (const syncedItem of result.synced) {
        if (syncedItem.entity === 'session' && syncedItem.data?.id) {
          await db.sessions.update(syncedItem.data.id, { synced: true });
        } else if (syncedItem.entity === 'session_note' && syncedItem.data?.id) {
          await db.notes.update(syncedItem.data.id, { synced: true });
        }
      }

      const state: SyncState = result.errors.length > 0 ? 'error' : 'idle';
      this.notifyState(state);

      return {
        synced: result.synced.length,
        errors: result.errors.length,
        state,
      };
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyState('error');
      return { synced: 0, errors: 1, state: 'error' };
    } finally {
      this.syncInProgress = false;
    }
  }

  private async notifyState(state: SyncState) {
    if (this.onStateChange) {
      const count = await getPendingCount();
      this.onStateChange(state, count);
    }
  }

  async getPendingCount(): Promise<number> {
    return getPendingCount();
  }
}

export const syncEngine = new SyncEngine();
