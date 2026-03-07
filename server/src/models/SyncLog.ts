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
  public id!: string;
  public user_id!: string;
  public sync_type!: SyncType;
  public pending_changes!: object;
  public sync_status!: SyncStatus;
  public error_message!: string | null;
  public synced_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
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
      type: DataTypes.ENUM(...Object.values(SyncType)),
      allowNull: false,
    },
    pending_changes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    sync_status: {
      type: DataTypes.ENUM(...Object.values(SyncStatus)),
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
