import React, { useEffect, useState } from 'react';
import { MapPin, Clock, Users, Play, Square } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { assignmentsApi, sessionsApi, notesApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useTimer } from '../../hooks/useTimer';
import { ClassAssignment, Session } from '../../types';

export function AssignedClasses() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const elapsed = useTimer(activeSession?.check_in_time || null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignRes, activeRes] = await Promise.all([
        assignmentsApi.getByTrainer(user!.id),
        sessionsApi.getActive(),
      ]);
      setAssignments(assignRes.data.data || []);
      setActiveSession(activeRes.data.data || null);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (classId: string) => {
    setCheckingIn(true);
    try {
      const res = await sessionsApi.checkin(classId);
      setActiveSession(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckout = async () => {
    if (!activeSession) return;
    setCheckingOut(true);
    try {
      await sessionsApi.checkout(activeSession.id);
      setActiveSession(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleAddNote = async () => {
    if (!activeSession || !noteText.trim()) return;
    setAddingNote(true);
    try {
      await notesApi.create(activeSession.id, noteText.trim());
      setNoteText('');
      const activeRes = await sessionsApi.getActive();
      setActiveSession(activeRes.data.data || null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>

      {/* Active Session */}
      {activeSession && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-green-900">Active Session</h2>
              <p className="text-green-700">{activeSession.class?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-mono font-bold text-green-900">{elapsed}</span>
              <Button variant="danger" onClick={handleCheckout} isLoading={checkingOut}>
                <Square className="w-4 h-4 mr-2" />
                Check Out
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-green-200 pt-4">
            <div className="flex gap-2 mb-3">
              <Input
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add a session note..."
                className="flex-1"
              />
              <Button onClick={handleAddNote} isLoading={addingNote} disabled={!noteText.trim()}>
                Add Note
              </Button>
            </div>
            {activeSession.notes && activeSession.notes.length > 0 && (
              <div className="space-y-2">
                {activeSession.notes.map(note => (
                  <div key={note.id} className="text-sm bg-white/50 p-2 rounded">
                    {note.note_text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Class List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {assignments.map(assignment => (
          <Card key={assignment.id}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900">{assignment.class?.name}</h3>
              <Badge variant={assignment.class?.status === 'active' ? 'success' : 'gray'}>
                {assignment.class?.status}
              </Badge>
            </div>
            {assignment.class?.description && (
              <p className="text-sm text-gray-600 mb-3">{assignment.class.description}</p>
            )}
            <div className="space-y-1 text-sm text-gray-500 mb-4">
              {assignment.class?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {assignment.class.location}
                </div>
              )}
              {assignment.class?.scheduled_time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {(assignment.class.scheduled_time as any).day} at {(assignment.class.scheduled_time as any).time}
                </div>
              )}
              {assignment.class?.capacity && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Capacity: {assignment.class.capacity}
                </div>
              )}
            </div>
            <Button
              onClick={() => handleCheckin(assignment.class_id)}
              isLoading={checkingIn}
              disabled={!!activeSession}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              {activeSession ? 'Already in session' : 'Check In'}
            </Button>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-500">No classes assigned yet.</p>
          <p className="text-sm text-gray-400 mt-1">Contact your supervisor to get assigned to classes.</p>
        </Card>
      )}
    </div>
  );
}
