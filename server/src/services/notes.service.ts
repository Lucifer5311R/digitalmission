import { SessionNote, Session } from '../models';
import { AppError } from '../middleware/errorHandler';

export class NotesService {
  async create(sessionId: string, noteText: string, createdBy: string) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new AppError('Session not found', 404);

    return SessionNote.create({
      session_id: sessionId,
      note_text: noteText,
      created_by: createdBy,
    });
  }

  async findBySession(sessionId: string) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new AppError('Session not found', 404);

    return SessionNote.findAll({
      where: { session_id: sessionId },
      order: [['created_at', 'DESC']],
    });
  }

  async delete(noteId: string, userId: string) {
    const note = await SessionNote.findByPk(noteId);
    if (!note) throw new AppError('Note not found', 404);
    if (note.created_by !== userId) throw new AppError('You can only delete your own notes', 403);

    await note.destroy();
    return { message: 'Note deleted successfully' };
  }
}

export default new NotesService();
