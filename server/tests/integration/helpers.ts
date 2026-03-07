/**
 * Integration test helpers.
 *
 * Swaps out the production Sequelize instance (PostgreSQL) for an in-memory
 * SQLite database so the full Express stack (routes → controllers → services
 * → models) can be exercised without any external infrastructure.
 *
 * Usage in each *.test.ts:
 *   import { getTestApp, syncDatabase, closeDatabase, seedTestData, TestData } from './helpers';
 */

import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/* ------------------------------------------------------------------ */
/*  Environment – must be set BEFORE any src/ import                  */
/* ------------------------------------------------------------------ */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';
process.env.JWT_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

/* ------------------------------------------------------------------ */
/*  In-memory SQLite Sequelize instance                               */
/* ------------------------------------------------------------------ */
const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  define: { timestamps: true, underscored: true },
});

/* ------------------------------------------------------------------ */
/*  Re-define models on testSequelize (mirrors src/models)            */
/* ------------------------------------------------------------------ */

// ---------- User ----------
enum UserRole {
  TRAINER = 'trainer',
  SUPERVISOR = 'supervisor',
}
enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

interface UserAttrs {
  id: string; name: string; email: string; password_hash: string;
  role: UserRole; status: UserStatus; refresh_token: string | null;
  created_at?: Date; updated_at?: Date;
}
class UserModel extends Model<UserAttrs, Optional<UserAttrs, 'id' | 'status' | 'refresh_token' | 'created_at' | 'updated_at'>> implements UserAttrs {
  public id!: string; public name!: string; public email!: string;
  public password_hash!: string; public role!: UserRole; public status!: UserStatus;
  public refresh_token!: string | null;
  public readonly created_at!: Date; public readonly updated_at!: Date;
}
UserModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: UserRole.TRAINER },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: UserStatus.ACTIVE },
  refresh_token: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize: testSequelize, tableName: 'users', modelName: 'User', timestamps: true, underscored: true });

// ---------- Class ----------
enum ClassStatus { ACTIVE = 'active', INACTIVE = 'inactive', ARCHIVED = 'archived' }

interface ClassAttrs {
  id: string; name: string; description: string | null; scheduled_time: object | null;
  location: string | null; capacity: number | null; status: ClassStatus;
  created_by: string; created_at?: Date; updated_at?: Date;
}
class ClassModel extends Model<ClassAttrs, Optional<ClassAttrs, 'id' | 'description' | 'scheduled_time' | 'location' | 'capacity' | 'status' | 'created_at' | 'updated_at'>> implements ClassAttrs {
  public id!: string; public name!: string; public description!: string | null;
  public scheduled_time!: object | null; public location!: string | null;
  public capacity!: number | null; public status!: ClassStatus; public created_by!: string;
  public readonly created_at!: Date; public readonly updated_at!: Date;
}
ClassModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  scheduled_time: { type: DataTypes.JSON, allowNull: true },
  location: { type: DataTypes.STRING(200), allowNull: true },
  capacity: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: ClassStatus.ACTIVE },
  created_by: { type: DataTypes.UUID, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize: testSequelize, tableName: 'classes', modelName: 'Class', timestamps: true, underscored: true });

// ---------- ClassAssignment ----------
interface AssignAttrs {
  id: string; trainer_id: string; class_id: string; assigned_date: Date;
  is_active: boolean; assigned_by: string; created_at?: Date; updated_at?: Date;
}
class AssignmentModel extends Model<AssignAttrs, Optional<AssignAttrs, 'id' | 'assigned_date' | 'is_active' | 'created_at' | 'updated_at'>> implements AssignAttrs {
  public id!: string; public trainer_id!: string; public class_id!: string;
  public assigned_date!: Date; public is_active!: boolean; public assigned_by!: string;
  public readonly created_at!: Date; public readonly updated_at!: Date;
}
AssignmentModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainer_id: { type: DataTypes.UUID, allowNull: false },
  class_id: { type: DataTypes.UUID, allowNull: false },
  assigned_date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  assigned_by: { type: DataTypes.UUID, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize: testSequelize, tableName: 'class_assignments', modelName: 'ClassAssignment', timestamps: true, underscored: true });

// ---------- Session ----------
enum SessionStatus { ACTIVE = 'active', COMPLETED = 'completed' }
interface SessionAttrs {
  id: string; trainer_id: string; class_id: string; check_in_time: Date;
  check_out_time: Date | null; duration_minutes: number | null; status: SessionStatus;
  created_at?: Date; updated_at?: Date;
}
class SessionModel extends Model<SessionAttrs, Optional<SessionAttrs, 'id' | 'check_out_time' | 'duration_minutes' | 'status' | 'created_at' | 'updated_at'>> implements SessionAttrs {
  public id!: string; public trainer_id!: string; public class_id!: string;
  public check_in_time!: Date; public check_out_time!: Date | null;
  public duration_minutes!: number | null; public status!: SessionStatus;
  public readonly created_at!: Date; public readonly updated_at!: Date;
}
SessionModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainer_id: { type: DataTypes.UUID, allowNull: false },
  class_id: { type: DataTypes.UUID, allowNull: false },
  check_in_time: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  check_out_time: { type: DataTypes.DATE, allowNull: true },
  duration_minutes: { type: DataTypes.FLOAT, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: SessionStatus.ACTIVE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize: testSequelize, tableName: 'sessions', modelName: 'Session', timestamps: true, underscored: true });

// ---------- SessionNote ----------
interface NoteAttrs {
  id: string; session_id: string; note_text: string; created_by: string;
  created_at?: Date; updated_at?: Date;
}
class SessionNoteModel extends Model<NoteAttrs, Optional<NoteAttrs, 'id' | 'created_at' | 'updated_at'>> implements NoteAttrs {
  public id!: string; public session_id!: string; public note_text!: string;
  public created_by!: string;
  public readonly created_at!: Date; public readonly updated_at!: Date;
}
SessionNoteModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  session_id: { type: DataTypes.UUID, allowNull: false },
  note_text: { type: DataTypes.TEXT, allowNull: false },
  created_by: { type: DataTypes.UUID, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize: testSequelize, tableName: 'session_notes', modelName: 'SessionNote', timestamps: true, underscored: true });

// ---------- TrainerRating ----------
interface RatingAttrs {
  id: string; trainer_id: string; rated_by: string; rating: number;
  feedback_text: string | null; rated_at: Date; created_at?: Date; updated_at?: Date;
}
class TrainerRatingModel extends Model<RatingAttrs, Optional<RatingAttrs, 'id' | 'feedback_text' | 'rated_at' | 'created_at' | 'updated_at'>> implements RatingAttrs {
  public id!: string; public trainer_id!: string; public rated_by!: string;
  public rating!: number; public feedback_text!: string | null; public rated_at!: Date;
  public readonly created_at!: Date; public readonly updated_at!: Date;
}
TrainerRatingModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  trainer_id: { type: DataTypes.UUID, allowNull: false },
  rated_by: { type: DataTypes.UUID, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  feedback_text: { type: DataTypes.TEXT, allowNull: true },
  rated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize: testSequelize, tableName: 'trainer_ratings', modelName: 'TrainerRating', timestamps: true, underscored: true });

// ---------- SyncLog (minimal – needed so models/index doesn't break) ----------
interface SyncLogAttrs {
  id: string; user_id: string; sync_type: string; pending_changes: object;
  sync_status: string; error_message: string | null; synced_at: Date | null;
  created_at?: Date; updated_at?: Date;
}
class SyncLogModel extends Model<SyncLogAttrs, Optional<SyncLogAttrs, 'id' | 'sync_status' | 'error_message' | 'synced_at' | 'created_at' | 'updated_at'>> implements SyncLogAttrs {
  public id!: string; public user_id!: string; public sync_type!: string;
  public pending_changes!: object; public sync_status!: string;
  public error_message!: string | null; public synced_at!: Date | null;
  public readonly created_at!: Date; public readonly updated_at!: Date;
}
SyncLogModel.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  sync_type: { type: DataTypes.STRING, allowNull: false },
  pending_changes: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
  sync_status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  error_message: { type: DataTypes.TEXT, allowNull: true },
  synced_at: { type: DataTypes.DATE, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize: testSequelize, tableName: 'sync_logs', modelName: 'SyncLog', timestamps: true, underscored: true });

/* ------------------------------------------------------------------ */
/*  Associations (mirror src/models/index.ts)                         */
/* ------------------------------------------------------------------ */
UserModel.hasMany(AssignmentModel, { foreignKey: 'trainer_id', as: 'assignments' });
UserModel.hasMany(SessionModel, { foreignKey: 'trainer_id', as: 'sessions' });
UserModel.hasMany(SessionNoteModel, { foreignKey: 'created_by', as: 'notes' });
UserModel.hasMany(TrainerRatingModel, { foreignKey: 'trainer_id', as: 'ratingsReceived' });
UserModel.hasMany(TrainerRatingModel, { foreignKey: 'rated_by', as: 'ratingsGiven' });
UserModel.hasMany(ClassModel, { foreignKey: 'created_by', as: 'createdClasses' });
UserModel.hasMany(SyncLogModel, { foreignKey: 'user_id', as: 'syncLogs' });

ClassModel.belongsTo(UserModel, { foreignKey: 'created_by', as: 'creator' });
ClassModel.hasMany(AssignmentModel, { foreignKey: 'class_id', as: 'assignments' });
ClassModel.hasMany(SessionModel, { foreignKey: 'class_id', as: 'sessions' });

AssignmentModel.belongsTo(UserModel, { foreignKey: 'trainer_id', as: 'trainer' });
AssignmentModel.belongsTo(ClassModel, { foreignKey: 'class_id', as: 'class' });
AssignmentModel.belongsTo(UserModel, { foreignKey: 'assigned_by', as: 'assignedByUser' });

SessionModel.belongsTo(UserModel, { foreignKey: 'trainer_id', as: 'trainer' });
SessionModel.belongsTo(ClassModel, { foreignKey: 'class_id', as: 'class' });
SessionModel.hasMany(SessionNoteModel, { foreignKey: 'session_id', as: 'notes' });

SessionNoteModel.belongsTo(SessionModel, { foreignKey: 'session_id', as: 'session' });
SessionNoteModel.belongsTo(UserModel, { foreignKey: 'created_by', as: 'author' });

TrainerRatingModel.belongsTo(UserModel, { foreignKey: 'trainer_id', as: 'trainer' });
TrainerRatingModel.belongsTo(UserModel, { foreignKey: 'rated_by', as: 'rater' });

SyncLogModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

/* ------------------------------------------------------------------ */
/*  Mock the modules that the real app.ts / services / controllers    */
/*  will pull in, so they all operate against testSequelize.           */
/* ------------------------------------------------------------------ */
jest.mock('@/config/database', () => testSequelize);

jest.mock('@/models', () => ({
  sequelize: testSequelize,
  User: UserModel,
  Class: ClassModel,
  ClassAssignment: AssignmentModel,
  Session: SessionModel,
  SessionNote: SessionNoteModel,
  TrainerRating: TrainerRatingModel,
  SyncLog: SyncLogModel,
}));

jest.mock('@/models/User', () => ({
  __esModule: true,
  default: UserModel,
  UserRole: { TRAINER: 'trainer', SUPERVISOR: 'supervisor' },
  UserStatus: { ACTIVE: 'active', INACTIVE: 'inactive' },
}));

jest.mock('@/models/Class', () => ({
  __esModule: true,
  default: ClassModel,
  ClassStatus: { ACTIVE: 'active', INACTIVE: 'inactive', ARCHIVED: 'archived' },
}));

jest.mock('@/models/ClassAssignment', () => ({ __esModule: true, default: AssignmentModel }));

jest.mock('@/models/Session', () => ({
  __esModule: true,
  default: SessionModel,
  SessionStatus: { ACTIVE: 'active', COMPLETED: 'completed' },
}));

jest.mock('@/models/SessionNote', () => ({ __esModule: true, default: SessionNoteModel }));

jest.mock('@/models/TrainerRating', () => ({ __esModule: true, default: TrainerRatingModel }));

jest.mock('@/models/SyncLog', () => ({
  __esModule: true,
  default: SyncLogModel,
  SyncType: { PUSH: 'push', PULL: 'pull' },
  SyncStatus: { PENDING: 'pending', COMPLETED: 'completed', FAILED: 'failed' },
}));

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

import { hashPassword } from '@/utils/password';

export interface TestData {
  supervisorId: string;
  trainerId: string;
  classId: string;
  assignmentId: string;
  supervisorToken: string;
  trainerToken: string;
}

export async function syncDatabase(): Promise<void> {
  await testSequelize.sync({ force: true });
}

export async function closeDatabase(): Promise<void> {
  await testSequelize.close();
}

export async function seedTestData(): Promise<TestData> {
  const passwordHash = await hashPassword('Test@1234');

  const supervisor = await UserModel.create({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Test Supervisor',
    email: 'supervisor@test.com',
    password_hash: passwordHash,
    role: UserRole.SUPERVISOR,
    status: UserStatus.ACTIVE,
    refresh_token: null,
  });

  const trainer = await UserModel.create({
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'Test Trainer',
    email: 'trainer@test.com',
    password_hash: passwordHash,
    role: UserRole.TRAINER,
    status: UserStatus.ACTIVE,
    refresh_token: null,
  });

  const cls = await ClassModel.create({
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    name: 'Test Class',
    description: 'A test class',
    location: 'Room 101',
    capacity: 30,
    created_by: supervisor.id,
  });

  const assignment = await AssignmentModel.create({
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    trainer_id: trainer.id,
    class_id: cls.id,
    assigned_by: supervisor.id,
  });

  // Generate real JWTs so the auth middleware accepts them
  const supervisorToken = jwt.sign(
    { id: supervisor.id, email: supervisor.email, role: supervisor.role, name: supervisor.name },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' },
  );
  const trainerToken = jwt.sign(
    { id: trainer.id, email: trainer.email, role: trainer.role, name: trainer.name },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' },
  );

  return {
    supervisorId: supervisor.id,
    trainerId: trainer.id,
    classId: cls.id,
    assignmentId: assignment.id,
    supervisorToken,
    trainerToken,
  };
}

/**
 * Returns the Express app. Must be called **after** the jest.mock calls above
 * have taken effect (i.e. inside a test file that imports this helper).
 */
export function getTestApp(): express.Express {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const app = require('@/app').default;
  return app;
}

export {
  testSequelize,
  UserModel,
  ClassModel,
  AssignmentModel,
  SessionModel,
  SessionNoteModel,
  TrainerRatingModel,
  SyncLogModel,
  UserRole,
  UserStatus,
  ClassStatus,
  SessionStatus,
};
