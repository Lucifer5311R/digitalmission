import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

interface SessionAttributes {
  id: string;
  trainer_id: string;
  class_id: string;
  check_in_time: Date;
  check_out_time: Date | null;
  duration_minutes: number | null;
  status: SessionStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface SessionCreationAttributes extends Optional<SessionAttributes, 'id' | 'check_out_time' | 'duration_minutes' | 'status' | 'created_at' | 'updated_at'> {}

class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  public id!: string;
  public trainer_id!: string;
  public class_id!: string;
  public check_in_time!: Date;
  public check_out_time!: Date | null;
  public duration_minutes!: number | null;
  public status!: SessionStatus;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trainer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'classes', key: 'id' },
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration_minutes: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SessionStatus)),
      allowNull: false,
      defaultValue: SessionStatus.ACTIVE,
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
    tableName: 'sessions',
    modelName: 'Session',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['trainer_id'] },
      { fields: ['class_id'] },
      { fields: ['check_in_time'] },
      { fields: ['status'] },
    ],
  }
);

export default Session;
