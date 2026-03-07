import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ClassAssignmentAttributes {
  id: string;
  trainer_id: string;
  class_id: string;
  assigned_date: Date;
  is_active: boolean;
  assigned_by: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ClassAssignmentCreationAttributes extends Optional<ClassAssignmentAttributes, 'id' | 'assigned_date' | 'is_active' | 'created_at' | 'updated_at'> {}

class ClassAssignment extends Model<ClassAssignmentAttributes, ClassAssignmentCreationAttributes> implements ClassAssignmentAttributes {
  public id!: string;
  public trainer_id!: string;
  public class_id!: string;
  public assigned_date!: Date;
  public is_active!: boolean;
  public assigned_by!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ClassAssignment.init(
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
    assigned_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    assigned_by: {
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
    tableName: 'class_assignments',
    modelName: 'ClassAssignment',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['trainer_id', 'class_id'],
        where: { is_active: true },
        name: 'unique_active_assignment',
      },
    ],
  }
);

export default ClassAssignment;
