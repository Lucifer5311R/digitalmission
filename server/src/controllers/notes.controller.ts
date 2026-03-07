import { Response, NextFunction } from 'express';
import notesService from '../services/notes.service';
import { AuthRequest, ApiResponse } from '../types';

export class NotesController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const note = await notesService.create(req.params.id, req.body.note_text, req.user!.id);
      const response: ApiResponse = { success: true, data: note, message: 'Note added' };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async findBySession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notes = await notesService.findBySession(req.params.id);
      const response: ApiResponse = { success: true, data: notes };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await notesService.delete(req.params.noteId, req.user!.id);
      const response: ApiResponse = { success: true, message: result.message };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new NotesController();
