import sequelize from '../config/database';
import User from './User';
import Class from './Class';
import ClassAssignment from './ClassAssignment';
import Session from './Session';
import SessionNote from './SessionNote';
import TrainerRating from './TrainerRating';
import SyncLog from './SyncLog';

// User associations
User.hasMany(ClassAssignment, { foreignKey: 'trainer_id', as: 'assignments' });
User.hasMany(Session, { foreignKey: 'trainer_id', as: 'sessions' });
User.hasMany(SessionNote, { foreignKey: 'created_by', as: 'notes' });
User.hasMany(TrainerRating, { foreignKey: 'trainer_id', as: 'ratingsReceived' });
User.hasMany(TrainerRating, { foreignKey: 'rated_by', as: 'ratingsGiven' });
User.hasMany(Class, { foreignKey: 'created_by', as: 'createdClasses' });
User.hasMany(SyncLog, { foreignKey: 'user_id', as: 'syncLogs' });

// Class associations
Class.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Class.hasMany(ClassAssignment, { foreignKey: 'class_id', as: 'assignments' });
Class.hasMany(Session, { foreignKey: 'class_id', as: 'sessions' });

// ClassAssignment associations
ClassAssignment.belongsTo(User, { foreignKey: 'trainer_id', as: 'trainer' });
ClassAssignment.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
ClassAssignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedByUser' });

// Session associations
Session.belongsTo(User, { foreignKey: 'trainer_id', as: 'trainer' });
Session.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Session.hasMany(SessionNote, { foreignKey: 'session_id', as: 'notes' });

// SessionNote associations
SessionNote.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
SessionNote.belongsTo(User, { foreignKey: 'created_by', as: 'author' });

// TrainerRating associations
TrainerRating.belongsTo(User, { foreignKey: 'trainer_id', as: 'trainer' });
TrainerRating.belongsTo(User, { foreignKey: 'rated_by', as: 'rater' });

// SyncLog associations
SyncLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  sequelize,
  User,
  Class,
  ClassAssignment,
  Session,
  SessionNote,
  TrainerRating,
  SyncLog,
};
