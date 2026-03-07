import { Response, NextFunction } from 'express';
import attendanceService from '../services/attendance.service';
import { AuthRequest, ApiResponse } from '../types';

export class AttendanceController {
  async mark(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { class_id, date, records, session_id } = req.body;
      const result = await attendanceService.markAttendance({
        class_id,
        date,
        records,
        marked_by: req.user!.id,
        session_id,
      });
      const response: ApiResponse = { success: true, data: result, message: 'Attendance marked successfully' };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getByClassAndDate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { class_id, date } = req.query;
      const records = await attendanceService.getByClassAndDate(class_id as string, date as string);
      const response: ApiResponse = { success: true, data: records };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getByStudent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const records = await attendanceService.getByStudent(req.params.id, {
        startDate: startDate as string,
        endDate: endDate as string,
      });
      const response: ApiResponse = { success: true, data: records };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { class_id } = req.query;
      const summary = await attendanceService.getSummary(class_id as string);
      const response: ApiResponse = { success: true, data: summary };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async upload(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' } as ApiResponse);
        return;
      }
      const classId = req.body.class_id || (req.query.class_id as string);
      if (!classId) {
        res.status(400).json({ success: false, error: 'class_id is required' } as ApiResponse);
        return;
      }
      const result = await attendanceService.uploadAttendance(classId, req.file.path, req.user!.id);
      const response: ApiResponse = { success: true, data: result, message: 'Attendance uploaded successfully' };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendanceController();
