import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TrainerRatingAttributes {
  id: string;
  trainer_id: string;
  rated_by: string;
  rating: number;
  feedback_text: string | null;
  rated_at: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface TrainerRatingCreationAttributes extends Optional<TrainerRatingAttributes, 'id' | 'feedback_text' | 'rated_at' | 'created_at' | 'updated_at'> {}

class TrainerRating extends Model<TrainerRatingAttributes, TrainerRatingCreationAttributes> implements TrainerRatingAttributes {
  declare id: string;
  declare trainer_id: string;
  declare rated_by: string;
  declare rating: number;
  declare feedback_text: string | null;
  declare rated_at: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

TrainerRating.init(
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
      onDelete: 'CASCADE',
    },
    rated_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    feedback_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: 'trainer_ratings',
    modelName: 'TrainerRating',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['trainer_id'] },
      { fields: ['rated_by'] },
      { unique: true, fields: ['trainer_id', 'rated_by'], name: 'unique_trainer_rating_per_supervisor' },
    ],
  }
);

export default TrainerRating;
