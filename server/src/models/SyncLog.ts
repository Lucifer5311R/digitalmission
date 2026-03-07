import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum SyncType {
  PUSH = 'push',
  PULL = 'pull',
}

export enum SyncStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

interface SyncLogAttributes {
  id: string;
  user_id: string;
  sync_type: SyncType;
  pending_changes: object;
  sync_status: SyncStatus;
  error_message: string | null;
  synced_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

interface SyncLogCreationAttributes extends Optional<SyncLogAttributes, 'id' | 'sync_status' | 'error_message' | 'synced_at' | 'created_at' | 'updated_at'> {}

class SyncLog extends Model<SyncLogAttributes, SyncLogCreationAttributes> implements SyncLogAttributes {
  declare id: string;
  declare user_id: string;
  declare sync_type: SyncType;
  declare pending_changes: object;
  declare sync_status: SyncStatus;
  declare error_message: string | null;
  declare synced_at: Date | null;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

SyncLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    sync_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    pending_changes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    sync_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: SyncStatus.PENDING,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    synced_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'sync_logs',
    modelName: 'SyncLog',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['sync_status'] },
    ],
  }
);

export default SyncLog;
