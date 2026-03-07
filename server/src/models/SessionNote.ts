import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SessionNoteAttributes {
  id: string;
  session_id: string;
  note_text: string;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

interface SessionNoteCreationAttributes extends Optional<SessionNoteAttributes, 'id' | 'created_at' | 'updated_at'> {}

class SessionNote extends Model<SessionNoteAttributes, SessionNoteCreationAttributes> implements SessionNoteAttributes {
  declare id: string;
  declare session_id: string;
  declare note_text: string;
  declare created_by: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

SessionNote.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'sessions', key: 'id' },
    },
    note_text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
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
    tableName: 'session_notes',
    modelName: 'SessionNote',
    timestamps: true,
    underscored: true,
  }
);

export default SessionNote;
