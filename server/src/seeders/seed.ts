import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sequelize, User, Class, ClassAssignment, Session, SessionNote, TrainerRating } from '../models';
import { UserRole, UserStatus } from '../models/User';
import { ClassStatus } from '../models/Class';
import { SessionStatus } from '../models/Session';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected for seeding...');

    // Sync all models (force: true drops tables first)
    await sequelize.sync({ force: true });
    console.log('Tables created...');

    const passwordHash = await bcrypt.hash('admin123', 12);
    const trainerPasswordHash = await bcrypt.hash('trainer123', 12);

    // Create supervisors
    const supervisor1 = await User.create({
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@attendance.com',
      password_hash: passwordHash,
      role: UserRole.SUPERVISOR,
      status: UserStatus.ACTIVE,
    });

    const supervisor2 = await User.create({
      id: uuidv4(),
      name: 'Sarah Johnson',
      email: 'supervisor@attendance.com',
      password_hash: await bcrypt.hash('super123', 12),
      role: UserRole.SUPERVISOR,
      status: UserStatus.ACTIVE,
    });

    // Create trainers
    const trainers = [];
    const trainerNames = [
      { name: 'John Smith', email: 'trainer1@attendance.com' },
      { name: 'Emily Davis', email: 'trainer2@attendance.com' },
      { name: 'Michael Brown', email: 'trainer3@attendance.com' },
      { name: 'Jessica Wilson', email: 'trainer4@attendance.com' },
      { name: 'David Martinez', email: 'trainer5@attendance.com' },
    ];

    for (const t of trainerNames) {
      const trainer = await User.create({
        id: uuidv4(),
        name: t.name,
        email: t.email,
        password_hash: trainerPasswordHash,
        role: UserRole.TRAINER,
        status: UserStatus.ACTIVE,
      });
      trainers.push(trainer);
    }

    // Create classes
    const classes = [];
    const classData = [
      { name: 'Morning Yoga', description: 'Beginner-friendly yoga session', location: 'Studio A', capacity: 20, scheduled_time: { day: 'Monday', time: '08:00' } },
      { name: 'HIIT Training', description: 'High-intensity interval training', location: 'Gym Floor', capacity: 15, scheduled_time: { day: 'Tuesday', time: '10:00' } },
      { name: 'Pilates', description: 'Core strengthening Pilates class', location: 'Studio B', capacity: 12, scheduled_time: { day: 'Wednesday', time: '09:00' } },
      { name: 'Strength Training', description: 'Full body strength workout', location: 'Weight Room', capacity: 10, scheduled_time: { day: 'Thursday', time: '14:00' } },
    ];

    for (const c of classData) {
      const cls = await Class.create({
        id: uuidv4(),
        name: c.name,
        description: c.description,
        location: c.location,
        capacity: c.capacity,
        scheduled_time: c.scheduled_time,
        status: ClassStatus.ACTIVE,
        created_by: supervisor1.id,
      });
      classes.push(cls);
    }

    // Create assignments
    const assignments = [
      { trainer: trainers[0], cls: classes[0] },
      { trainer: trainers[0], cls: classes[2] },
      { trainer: trainers[1], cls: classes[1] },
      { trainer: trainers[2], cls: classes[2] },
      { trainer: trainers[2], cls: classes[3] },
      { trainer: trainers[3], cls: classes[0] },
      { trainer: trainers[4], cls: classes[3] },
    ];

    for (const a of assignments) {
      await ClassAssignment.create({
        id: uuidv4(),
        trainer_id: a.trainer.id,
        class_id: a.cls.id,
        assigned_by: supervisor1.id,
      });
    }

    // Create some sample completed sessions
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(8, 0, 0, 0);

    const session1 = await Session.create({
      id: uuidv4(),
      trainer_id: trainers[0].id,
      class_id: classes[0].id,
      check_in_time: yesterday,
      check_out_time: new Date(yesterday.getTime() + 60 * 60 * 1000),
      duration_minutes: 60,
      status: SessionStatus.COMPLETED,
    });

    const session2 = await Session.create({
      id: uuidv4(),
      trainer_id: trainers[1].id,
      class_id: classes[1].id,
      check_in_time: yesterday,
      check_out_time: new Date(yesterday.getTime() + 90 * 60 * 1000),
      duration_minutes: 90,
      status: SessionStatus.COMPLETED,
    });

    // Create session notes
    await SessionNote.create({
      id: uuidv4(),
      session_id: session1.id,
      note_text: 'Great session today. All participants were engaged.',
      created_by: trainers[0].id,
    });

    await SessionNote.create({
      id: uuidv4(),
      session_id: session2.id,
      note_text: 'New equipment worked well. Need to order more resistance bands.',
      created_by: trainers[1].id,
    });

    // Create ratings
    await TrainerRating.create({
      id: uuidv4(),
      trainer_id: trainers[0].id,
      rated_by: supervisor1.id,
      rating: 5,
      feedback_text: 'Excellent trainer. Very professional and punctual.',
    });

    await TrainerRating.create({
      id: uuidv4(),
      trainer_id: trainers[1].id,
      rated_by: supervisor1.id,
      rating: 4,
      feedback_text: 'Good performance. Could improve on time management.',
    });

    await TrainerRating.create({
      id: uuidv4(),
      trainer_id: trainers[2].id,
      rated_by: supervisor2.id,
      rating: 4,
      feedback_text: 'Solid trainer with good client rapport.',
    });

    console.log('✅ Seed data created successfully!');
    console.log(`  - ${2} supervisors`);
    console.log(`  - ${trainers.length} trainers`);
    console.log(`  - ${classes.length} classes`);
    console.log(`  - ${assignments.length} assignments`);
    console.log(`  - 2 sessions with notes`);
    console.log(`  - 3 ratings`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

seed();
