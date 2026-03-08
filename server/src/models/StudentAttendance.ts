import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
}

interface StudentAttendanceAttributes {
  id: string;
  student_id: string;
  class_id: string;
  session_id: string | null;
  date: string;
  status: AttendanceStatus;
  marked_by: string;
  created_at?: Date;
  updated_at?: Date;
}

interface StudentAttendanceCreationAttributes extends Optional<StudentAttendanceAttributes, 'id' | 'session_id' | 'created_at' | 'updated_at'> {}

class StudentAttendance extends Model<StudentAttendanceAttributes, StudentAttendanceCreationAttributes> implements StudentAttendanceAttributes {
  declare id: string;
  declare student_id: string;
  declare class_id: string;
  declare session_id: string | null;
  declare date: string;
  declare status: AttendanceStatus;
  declare marked_by: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

StudentAttendance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'students', key: 'id' },
      onDelete: 'CASCADE',
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'classes', key: 'id' },
      onDelete: 'CASCADE',
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'sessions', key: 'id' },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    marked_by: {
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
    tableName: 'student_attendances',
    modelName: 'StudentAttendance',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'class_id', 'date'],
      },
    ],
  }
);

export default StudentAttendance;
