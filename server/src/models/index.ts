import sequelize from '../config/database';
import User from './User';
import Class from './Class';
import ClassAssignment from './ClassAssignment';
import Session from './Session';
import SessionNote from './SessionNote';
import TrainerRating from './TrainerRating';
import SyncLog from './SyncLog';
import Student from './Student';
import StudentAttendance from './StudentAttendance';
import Assessment from './Assessment';
import AssessmentMark from './AssessmentMark';
import AuditLog from './AuditLog';

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

// Student associations
Student.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Class.hasMany(Student, { foreignKey: 'class_id', as: 'students' });

// StudentAttendance associations
StudentAttendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
StudentAttendance.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
StudentAttendance.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
StudentAttendance.belongsTo(User, { foreignKey: 'marked_by', as: 'marker' });
Student.hasMany(StudentAttendance, { foreignKey: 'student_id', as: 'attendanceRecords' });
Class.hasMany(StudentAttendance, { foreignKey: 'class_id', as: 'attendanceRecords' });

// Assessment associations
Assessment.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Assessment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Class.hasMany(Assessment, { foreignKey: 'class_id', as: 'assessments' });
Assessment.hasMany(AssessmentMark, { foreignKey: 'assessment_id', as: 'marks' });

// AssessmentMark associations
AssessmentMark.belongsTo(Assessment, { foreignKey: 'assessment_id', as: 'assessment' });
AssessmentMark.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
AssessmentMark.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });
Student.hasMany(AssessmentMark, { foreignKey: 'student_id', as: 'marks' });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });

export {
  sequelize,
  User,
  Class,
  ClassAssignment,
  Session,
  SessionNote,
  TrainerRating,
  SyncLog,
  Student,
  StudentAttendance,
  Assessment,
  AssessmentMark,
  AuditLog,
};
