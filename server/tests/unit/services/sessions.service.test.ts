import { SessionsService } from '@/services/sessions.service';
import { SessionStatus } from '@/models/Session';

// Mock the models
jest.mock('@/models', () => ({
  Session: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAndCountAll: jest.fn(),
  },
  ClassAssignment: {
    findOne: jest.fn(),
  },
  User: {},
  Class: {},
  SessionNote: {},
}));

import { Session, ClassAssignment } from '@/models';

const mockSession = Session as jest.Mocked<typeof Session>;
const mockAssignment = ClassAssignment as jest.Mocked<typeof ClassAssignment>;

describe('SessionsService', () => {
  let sessionsService: SessionsService;

  beforeEach(() => {
    sessionsService = new SessionsService();
    jest.clearAllMocks();
  });

  describe('checkin', () => {
    const trainerId = '550e8400-e29b-41d4-a716-446655440000';
    const classId = '660e8400-e29b-41d4-a716-446655440000';

    it('should create a session on valid check-in', async () => {
      (mockAssignment.findOne as jest.Mock).mockResolvedValue({ id: 'assignment-1' });
      (mockSession.findOne as jest.Mock).mockResolvedValue(null); // no active session
      const createdSession = {
        id: 'session-1',
        trainer_id: trainerId,
        class_id: classId,
        status: SessionStatus.ACTIVE,
      };
      (mockSession.create as jest.Mock).mockResolvedValue(createdSession);

      const result = await sessionsService.checkin(trainerId, classId);

      expect(result).toEqual(createdSession);
      expect(mockAssignment.findOne).toHaveBeenCalledWith({
        where: { trainer_id: trainerId, class_id: classId, is_active: true },
      });
    });

    it('should throw if trainer is not assigned to class', async () => {
      (mockAssignment.findOne as jest.Mock).mockResolvedValue(null);

      await expect(sessionsService.checkin(trainerId, classId))
        .rejects.toThrow('You are not assigned to this class');
    });

    it('should throw if trainer already has an active session', async () => {
      (mockAssignment.findOne as jest.Mock).mockResolvedValue({ id: 'assignment-1' });
      (mockSession.findOne as jest.Mock).mockResolvedValue({ id: 'existing-session', status: SessionStatus.ACTIVE });

      await expect(sessionsService.checkin(trainerId, classId))
        .rejects.toThrow('You already have an active session');
    });
  });

  describe('checkout', () => {
    const sessionId = 'session-1';
    const trainerId = '550e8400-e29b-41d4-a716-446655440000';

    it('should checkout and calculate duration', async () => {
      const checkInTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const mockSessionObj = {
        id: sessionId,
        trainer_id: trainerId,
        check_in_time: checkInTime,
        status: SessionStatus.ACTIVE,
        update: jest.fn().mockResolvedValue(undefined),
      };
      (mockSession.findOne as jest.Mock).mockResolvedValue(mockSessionObj);

      const result = await sessionsService.checkout(sessionId, trainerId);

      expect(mockSessionObj.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SessionStatus.COMPLETED,
          check_out_time: expect.any(Date),
          duration_minutes: expect.any(Number),
        })
      );
      // Duration should be approximately 60 minutes
      const callArgs = mockSessionObj.update.mock.calls[0][0];
      expect(callArgs.duration_minutes).toBeGreaterThan(59);
      expect(callArgs.duration_minutes).toBeLessThan(61);
      expect(result).toBe(mockSessionObj);
    });

    it('should throw if session not found', async () => {
      (mockSession.findOne as jest.Mock).mockResolvedValue(null);

      await expect(sessionsService.checkout(sessionId, trainerId))
        .rejects.toThrow('Active session not found');
    });
  });

  describe('findMySessions', () => {
    const trainerId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return paginated sessions for a trainer', async () => {
      const mockResult = {
        rows: [{ id: 'session-1' }, { id: 'session-2' }],
        count: 2,
      };
      (mockSession.findAndCountAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await sessionsService.findMySessions(trainerId, { page: 1, limit: 20 });

      expect(result.sessions).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should apply date filters when provided', async () => {
      (mockSession.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      await sessionsService.findMySessions(trainerId, {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      const callArgs = (mockSession.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.check_in_time).toBeDefined();
    });
  });

  describe('getActiveSession', () => {
    it('should return the active session for a trainer', async () => {
      const activeSession = { id: 'session-1', status: SessionStatus.ACTIVE };
      (mockSession.findOne as jest.Mock).mockResolvedValue(activeSession);

      const result = await sessionsService.getActiveSession('trainer-1');

      expect(result).toEqual(activeSession);
    });

    it('should return null when no active session exists', async () => {
      (mockSession.findOne as jest.Mock).mockResolvedValue(null);

      const result = await sessionsService.getActiveSession('trainer-1');

      expect(result).toBeNull();
    });
  });
});
