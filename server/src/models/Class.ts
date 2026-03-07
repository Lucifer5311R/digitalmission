import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum ClassStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

interface ClassAttributes {
  id: string;
  name: string;
  description: string | null;
  scheduled_time: object | null;
  location: string | null;
  capacity: number | null;
  status: ClassStatus;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ClassCreationAttributes extends Optional<ClassAttributes, 'id' | 'description' | 'scheduled_time' | 'location' | 'capacity' | 'status' | 'created_at' | 'updated_at'> {}

class Class extends Model<ClassAttributes, ClassCreationAttributes> implements ClassAttributes {
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare scheduled_time: object | null;
  declare location: string | null;
  declare capacity: number | null;
  declare status: ClassStatus;
  declare created_by: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Class.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true, len: [2, 200] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scheduled_time: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1 },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: ClassStatus.ACTIVE,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
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
    tableName: 'classes',
    modelName: 'Class',
    timestamps: true,
    underscored: true,
  }
);

export default Class;
