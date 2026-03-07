import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AssessmentAttributes {
  id: string;
  class_id: string;
  name: string;
  max_marks: number;
  weightage: number | null;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

interface AssessmentCreationAttributes extends Optional<AssessmentAttributes, 'id' | 'weightage' | 'created_at' | 'updated_at'> {}

class Assessment extends Model<AssessmentAttributes, AssessmentCreationAttributes> implements AssessmentAttributes {
  declare id: string;
  declare class_id: string;
  declare name: string;
  declare max_marks: number;
  declare weightage: number | null;
  declare created_by: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Assessment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'classes', key: 'id' },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true },
    },
    max_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weightage: {
      type: DataTypes.FLOAT,
      allowNull: true,
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
    tableName: 'assessments',
    modelName: 'Assessment',
    timestamps: true,
    underscored: true,
  }
);

export default Assessment;
