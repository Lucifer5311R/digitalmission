import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AuditLogAttributes {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: object | null;
  new_value: object | null;
  ip_address: string | null;
  created_at?: Date;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'old_value' | 'new_value' | 'ip_address' | 'created_at'> {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  declare id: string;
  declare user_id: string;
  declare action: string;
  declare entity_type: string;
  declare entity_id: string;
  declare old_value: object | null;
  declare new_value: object | null;
  declare ip_address: string | null;
  declare readonly created_at: Date;
}

AuditLog.init(
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
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    old_value: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    new_value: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    modelName: 'AuditLog',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);

export default AuditLog;
