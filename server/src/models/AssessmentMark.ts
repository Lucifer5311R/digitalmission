import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AssessmentMarkAttributes {
  id: string;
  assessment_id: string;
  student_id: string;
  marks_obtained: number;
  remarks: string | null;
  updated_by: string;
  created_at?: Date;
  updated_at?: Date;
}

interface AssessmentMarkCreationAttributes extends Optional<AssessmentMarkAttributes, 'id' | 'remarks' | 'created_at' | 'updated_at'> {}

class AssessmentMark extends Model<AssessmentMarkAttributes, AssessmentMarkCreationAttributes> implements AssessmentMarkAttributes {
  declare id: string;
  declare assessment_id: string;
  declare student_id: string;
  declare marks_obtained: number;
  declare remarks: string | null;
  declare updated_by: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

AssessmentMark.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assessment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'assessments', key: 'id' },
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'students', key: 'id' },
    },
    marks_obtained: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updated_by: {
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
    tableName: 'assessment_marks',
    modelName: 'AssessmentMark',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['assessment_id', 'student_id'],
      },
    ],
  }
);

export default AssessmentMark;
