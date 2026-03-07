import { SyncLog, Session, SessionNote } from '../models';
import { SyncType, SyncStatus } from '../models/SyncLog';
import { SessionStatus } from '../models/Session';
import { AppError } from '../middleware/errorHandler';

interface SyncChange {
  entity: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

export class SyncService {
  async processSyncBatch(userId: string, changes: SyncChange[]) {
    const results: { synced: any[]; errors: any[] } = { synced: [], errors: [] };

    const syncLog = await SyncLog.create({
      user_id: userId,
      sync_type: SyncType.PUSH,
      pending_changes: { changes, count: changes.length },
      sync_status: SyncStatus.PENDING,
    });

    for (const change of changes) {
      try {
        const result = await this.processChange(userId, change);
        results.synced.push({ ...change, result });
      } catch (error: any) {
        results.errors.push({ ...change, error: error.message });
      }
    }

    const finalStatus = results.errors.length === 0 ? SyncStatus.COMPLETED : SyncStatus.FAILED;
    await syncLog.update({
      sync_status: finalStatus,
      synced_at: new Date(),
      error_message: results.errors.length > 0 ? JSON.stringify(results.errors) : null,
    });

    return results;
  }

  private async processChange(userId: string, change: SyncChange) {
    switch (change.entity) {
      case 'session':
        return this.processSessionChange(userId, change);
      case 'session_note':
        return this.processNoteChange(userId, change);
      default:
        throw new Error(`Unknown entity: ${change.entity}`);
    }
  }

  private async processSessionChange(userId: string, change: SyncChange) {
    if (change.action === 'create') {
      const existing = await Session.findByPk(change.data.id);
      if (existing) {
        // Last-write-wins: compare timestamps
        if (new Date(change.timestamp) > new Date(existing.updated_at)) {
          await existing.update(change.data);
          return existing;
        }
        return existing; // Server version is newer
      }
      return Session.create({ ...change.data, trainer_id: userId });
    }

    if (change.action === 'update') {
      const session = await Session.findByPk(change.data.id);
      if (!session) throw new Error('Session not found');
      if (new Date(change.timestamp) > new Date(session.updated_at)) {
        await session.update(change.data);
      }
      return session;
    }

    throw new Error(`Unsupported action: ${change.action}`);
  }

  private async processNoteChange(userId: string, change: SyncChange) {
    if (change.action === 'create') {
      const existing = await SessionNote.findByPk(change.data.id);
      if (existing) return existing;
      return SessionNote.create({ ...change.data, created_by: userId });
    }

    if (change.action === 'delete') {
      const note = await SessionNote.findByPk(change.data.id);
      if (note && note.created_by === userId) {
        await note.destroy();
      }
      return { deleted: true };
    }

    throw new Error(`Unsupported action: ${change.action}`);
  }

  async getSyncStatus(userId: string) {
    const latestSync = await SyncLog.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    const pendingCount = await SyncLog.count({
      where: { user_id: userId, sync_status: SyncStatus.PENDING },
    });

    return {
      lastSync: latestSync?.synced_at || null,
      lastSyncStatus: latestSync?.sync_status || null,
      pendingChanges: pendingCount,
    };
  }
}

export default new SyncService();
