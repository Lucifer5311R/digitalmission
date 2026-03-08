import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sequelize, User, Class, ClassAssignment, Session, SessionNote, TrainerRating, Student, StudentAttendance, Assessment, AssessmentMark, AuditLog } from '../models';
import { UserRole, UserStatus } from '../models/User';
import { ClassStatus } from '../models/Class';
import { SessionStatus } from '../models/Session';
import { StudentStatus } from '../models/Student';
import { AttendanceStatus } from '../models/StudentAttendance';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected for seeding...');

    // Sync all models (force: true drops tables first - only in development)
    const isDev = process.env.NODE_ENV !== 'production';
    await sequelize.sync({ force: isDev });
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
    const classes: InstanceType<typeof Class>[] = [];
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

    // Create students (5-8 per class)
    const allStudents: InstanceType<typeof Student>[] = [];
    const studentDataByClass = [
      [
        { register_no: 'REG001', name: 'Alice Thomas', email: 'alice@example.com', phone: '9876543210' },
        { register_no: 'REG002', name: 'Bob Kumar', email: 'bob@example.com', phone: null },
        { register_no: 'REG003', name: 'Charlie Singh', email: null, phone: '9876543212' },
        { register_no: 'REG004', name: 'Diana Patel', email: 'diana@example.com', phone: null },
        { register_no: 'REG005', name: 'Ethan Roy', email: null, phone: null },
        { register_no: 'REG006', name: 'Fiona Das', email: 'fiona@example.com', phone: '9876543215' },
      ],
      [
        { register_no: 'REG007', name: 'George Nair', email: 'george@example.com', phone: '9876543216' },
        { register_no: 'REG008', name: 'Hannah Rao', email: null, phone: '9876543217' },
        { register_no: 'REG009', name: 'Ian Sharma', email: 'ian@example.com', phone: null },
        { register_no: 'REG010', name: 'Julia Gupta', email: null, phone: null },
        { register_no: 'REG011', name: 'Kevin Iyer', email: 'kevin@example.com', phone: '9876543220' },
      ],
      [
        { register_no: 'REG012', name: 'Liam Verma', email: 'liam@example.com', phone: '9876543221' },
        { register_no: 'REG013', name: 'Mia Joshi', email: null, phone: null },
        { register_no: 'REG014', name: 'Noah Reddy', email: 'noah@example.com', phone: '9876543223' },
        { register_no: 'REG015', name: 'Olivia Menon', email: null, phone: '9876543224' },
        { register_no: 'REG016', name: 'Paul Pillai', email: 'paul@example.com', phone: null },
        { register_no: 'REG017', name: 'Quinn Bose', email: null, phone: null },
        { register_no: 'REG018', name: 'Rita Saha', email: 'rita@example.com', phone: '9876543227' },
      ],
      [
        { register_no: 'REG019', name: 'Sam Ghosh', email: 'sam@example.com', phone: '9876543228' },
        { register_no: 'REG020', name: 'Tina Banerjee', email: null, phone: '9876543229' },
        { register_no: 'REG021', name: 'Uma Dey', email: 'uma@example.com', phone: null },
        { register_no: 'REG022', name: 'Victor Sen', email: null, phone: null },
        { register_no: 'REG023', name: 'Wendy Mitra', email: 'wendy@example.com', phone: '9876543232' },
      ],
    ];

    const studentsByClass: InstanceType<typeof Student>[][] = [];
    for (let ci = 0; ci < classes.length; ci++) {
      const classStudents: InstanceType<typeof Student>[] = [];
      for (const s of studentDataByClass[ci]) {
        const student = await Student.create({
          id: uuidv4(),
          register_no: s.register_no,
          name: s.name,
          email: s.email,
          phone: s.phone,
          class_id: classes[ci].id,
          status: StudentStatus.ACTIVE,
        });
        classStudents.push(student);
        allStudents.push(student);
      }
      studentsByClass.push(classStudents);
    }

    // Create attendance records
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const attendanceRecords: { student: InstanceType<typeof Student>; cls: InstanceType<typeof Class>; status: AttendanceStatus }[] = [];

    // Class 0 attendance
    for (let i = 0; i < studentsByClass[0].length; i++) {
      const st = i < 4 ? AttendanceStatus.PRESENT : i === 4 ? AttendanceStatus.LATE : AttendanceStatus.ABSENT;
      attendanceRecords.push({ student: studentsByClass[0][i], cls: classes[0], status: st });
    }
    // Class 1 attendance
    for (let i = 0; i < studentsByClass[1].length; i++) {
      const st = i < 3 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
      attendanceRecords.push({ student: studentsByClass[1][i], cls: classes[1], status: st });
    }

    for (const rec of attendanceRecords) {
      await StudentAttendance.create({
        id: uuidv4(),
        student_id: rec.student.id,
        class_id: rec.cls.id,
        session_id: rec.cls.id === classes[0].id ? session1.id : session2.id,
        date: yesterdayStr,
        status: rec.status,
        marked_by: trainers[0].id,
      });
    }

    // Create assessments (2 per class)
    const allAssessments: InstanceType<typeof Assessment>[] = [];
    for (const cls of classes) {
      const cat = await Assessment.create({
        id: uuidv4(),
        class_id: cls.id,
        name: 'CAT-1',
        max_marks: 50,
        weightage: 0.3,
        created_by: supervisor1.id,
      });
      const assignment = await Assessment.create({
        id: uuidv4(),
        class_id: cls.id,
        name: 'Assignment-1',
        max_marks: 25,
        weightage: 0.2,
        created_by: supervisor1.id,
      });
      allAssessments.push(cat, assignment);
    }

    // Create sample marks for class 0 assessments
    let markCount = 0;
    const class0Assessments = allAssessments.filter((a) => a.class_id === classes[0].id);
    for (const assessment of class0Assessments) {
      for (const student of studentsByClass[0]) {
        const marks = assessment.name === 'CAT-1'
          ? Math.floor(Math.random() * 20) + 30
          : Math.floor(Math.random() * 10) + 15;
        await AssessmentMark.create({
          id: uuidv4(),
          assessment_id: assessment.id,
          student_id: student.id,
          marks_obtained: marks,
          remarks: marks > 40 ? 'Excellent' : null,
          updated_by: trainers[0].id,
        });
        markCount++;
      }
    }

    // Create audit log entries
    await AuditLog.create({
      id: uuidv4(),
      user_id: trainers[0].id,
      action: 'attendance_update',
      entity_type: 'StudentAttendance',
      entity_id: studentsByClass[0][0].id,
      old_value: null,
      new_value: { status: 'present', date: yesterdayStr },
      ip_address: '192.168.1.10',
    });

    await AuditLog.create({
      id: uuidv4(),
      user_id: supervisor1.id,
      action: 'mark_update',
      entity_type: 'AssessmentMark',
      entity_id: allAssessments[0].id,
      old_value: { marks: 35 },
      new_value: { marks: 40 },
      ip_address: '192.168.1.1',
    });

    console.log('✅ Seed data created successfully!');
    console.log(`  - ${2} supervisors`);
    console.log(`  - ${trainers.length} trainers`);
    console.log(`  - ${classes.length} classes`);
    console.log(`  - ${assignments.length} assignments`);
    console.log(`  - 2 sessions with notes`);
    console.log(`  - 3 ratings`);
    console.log(`  - ${allStudents.length} students`);
    console.log(`  - ${attendanceRecords.length} attendance records`);
    console.log(`  - ${allAssessments.length} assessments`);
    console.log(`  - ${markCount} assessment marks`);
    console.log(`  - 2 audit logs`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

seed();
