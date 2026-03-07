import { Sequelize, Op } from 'sequelize';
import { Class, Student, Assessment, AssessmentMark, StudentAttendance, User, Session, ClassAssignment, sequelize } from '../models';
import { AppError } from '../middleware/errorHandler';
import { UserRole, UserStatus } from '../models/User';
import { ClassStatus } from '../models/Class';
import { StudentStatus } from '../models/Student';
import { SessionStatus } from '../models/Session';
import { AttendanceStatus } from '../models/StudentAttendance';

export class AnalyticsService {
  async getClassPerformance(classId: string) {
    const cls = await Class.findByPk(classId);
    if (!cls) throw new AppError('Class not found', 404);

    const studentCount = await Student.count({ where: { class_id: classId, status: StudentStatus.ACTIVE } });
    const assessments = await Assessment.findAll({ where: { class_id: classId } });

    const assessmentStats = await Promise.all(
      assessments.map(async (assessment) => {
        const marks = await AssessmentMark.findAll({
          where: { assessment_id: assessment.id },
          attributes: [
            [Sequelize.fn('AVG', Sequelize.col('marks_obtained')), 'average'],
            [Sequelize.fn('MAX', Sequelize.col('marks_obtained')), 'highest'],
            [Sequelize.fn('MIN', Sequelize.col('marks_obtained')), 'lowest'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
          ],
          raw: true,
        }) as any[];

        const stats = marks[0] || { average: 0, highest: 0, lowest: 0, total: 0 };
        const passThreshold = assessment.max_marks * 0.4;

        const passCount = await AssessmentMark.count({
          where: {
            assessment_id: assessment.id,
            marks_obtained: { [Op.gte]: passThreshold },
          },
        });

        const failCount = (stats.total || 0) - passCount;

        return {
          assessment_name: assessment.name,
          max_marks: assessment.max_marks,
          average: parseFloat(stats.average) || 0,
          highest: parseFloat(stats.highest) || 0,
          lowest: parseFloat(stats.lowest) || 0,
          pass_count: passCount,
          fail_count: failCount,
        };
      })
    );

    // Top 5 students by average marks percentage
    const topStudents = await sequelize.query(
      `SELECT s.id, s.name, s.register_no,
        ROUND(AVG(am.marks_obtained * 100.0 / a.max_marks), 2) as avg_percentage
      FROM students s
      INNER JOIN assessment_marks am ON am.student_id = s.id
      INNER JOIN assessments a ON a.id = am.assessment_id
      WHERE a.class_id = :classId AND s.status = :activeStatus
      GROUP BY s.id, s.name, s.register_no
      ORDER BY avg_percentage DESC
      LIMIT 5`,
      {
        replacements: { classId, activeStatus: StudentStatus.ACTIVE },
        type: 'SELECT' as any,
      }
    );

    // Overall class average
    const overallAvg = await sequelize.query(
      `SELECT ROUND(AVG(am.marks_obtained * 100.0 / a.max_marks), 2) as overall_average
      FROM assessment_marks am
      INNER JOIN assessments a ON a.id = am.assessment_id
      WHERE a.class_id = :classId`,
      {
        replacements: { classId },
        type: 'SELECT' as any,
      }
    ) as any[];

    return {
      class_info: {
        id: cls.id,
        name: cls.name,
        student_count: studentCount,
        assessment_count: assessments.length,
      },
      assessment_stats: assessmentStats,
      top_students: topStudents,
      overall_average: overallAvg[0]?.overall_average || 0,
    };
  }

  async getAttendanceAlerts(threshold: number = 75) {
    const results = await sequelize.query(
      `SELECT s.id, s.name, s.register_no, c.name as class_name,
        COUNT(sa.id) as total_classes,
        SUM(CASE WHEN sa.status IN (:present, :late) THEN 1 ELSE 0 END) as present_count,
        ROUND(SUM(CASE WHEN sa.status IN (:present, :late) THEN 1 ELSE 0 END) * 100.0 / COUNT(sa.id), 2) as percentage
      FROM students s
      INNER JOIN classes c ON c.id = s.class_id
      INNER JOIN student_attendances sa ON sa.student_id = s.id
      WHERE s.status = :activeStatus
      GROUP BY s.id, s.name, s.register_no, c.name
      HAVING percentage < :threshold
      ORDER BY percentage ASC`,
      {
        replacements: {
          present: AttendanceStatus.PRESENT,
          late: AttendanceStatus.LATE,
          activeStatus: StudentStatus.ACTIVE,
          threshold,
        },
        type: 'SELECT' as any,
      }
    );

    return results;
  }

  async getDashboardStats() {
    const totalTrainers = await User.count({
      where: { role: UserRole.TRAINER, status: UserStatus.ACTIVE },
    });

    const totalStudents = await Student.count();

    const totalClasses = await Class.count({
      where: { status: ClassStatus.ACTIVE },
    });

    const totalAssignments = await ClassAssignment.count({
      where: { is_active: true },
    });

    const totalSessions = await Session.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalSessionsToday = await Session.count({
      where: {
        check_in_time: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    const totalHoursResult = await Session.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('duration_minutes')), 'total_minutes'],
      ],
      raw: true,
    }) as any[];

    const totalMinutes = totalHoursResult[0]?.total_minutes || 0;
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

    const activeSessionsNow = await Session.count({
      where: {
        check_out_time: null,
        status: SessionStatus.ACTIVE,
      },
    });

    return {
      total_trainers: totalTrainers,
      total_students: totalStudents,
      total_classes: totalClasses,
      total_assignments: totalAssignments,
      total_sessions: totalSessions,
      total_sessions_today: totalSessionsToday,
      total_hours: totalHours,
      active_sessions_now: activeSessionsNow,
    };
  }
}

export default new AnalyticsService();
