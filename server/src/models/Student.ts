import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

interface StudentAttributes {
  id: string;
  register_no: string;
  name: string;
  email: string | null;
  phone: string | null;
  class_id: string;
  status: StudentStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface StudentCreationAttributes extends Optional<StudentAttributes, 'id' | 'email' | 'phone' | 'status' | 'created_at' | 'updated_at'> {}

class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  declare id: string;
  declare register_no: string;
  declare name: string;
  declare email: string | null;
  declare phone: string | null;
  declare class_id: string;
  declare status: StudentStatus;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    register_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true, len: [2, 100] },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'classes', key: 'id' },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: StudentStatus.ACTIVE,
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
    tableName: 'students',
    modelName: 'Student',
    timestamps: true,
    underscored: true,
  }
);

export default Student;
