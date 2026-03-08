import React, { useEffect, useState } from 'react';
import { Plus, X, UserPlus, Clock } from 'lucide-react';
import { assignmentsApi, classesApi, usersApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ClassAssignment, ClassItem, ClassSchedule } from '../../types';
import { useToast } from '../../contexts/ToastContext';

function formatSchedule(s: ClassSchedule | null | undefined): string | null {
  if (!s || (!s.days?.length && !s.start_time)) return null;
  const days = s.days?.join(', ') || '';
  const time = s.start_time ? `${s.start_time}${s.end_time ? ` – ${s.end_time}` : ''}` : '';
  return [days, time].filter(Boolean).join('  •  ');
}

export function ScheduleTab() {
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [allTrainers, setAllTrainers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [assignRes, classesRes, trainersRes] = await Promise.all([
        assignmentsApi.getAll(),
        classesApi.getAll({ status: 'active' }),
        usersApi.getByRole('trainer'),
      ]);
      setAssignments(assignRes.data.data || []);
      setClasses(classesRes.data.data || []);
      setAllTrainers(trainersRes.data.data || []);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedClass || !selectedTrainer) return;
    setSubmitting(true);
    try {
      await assignmentsApi.create({ trainer_id: selectedTrainer, class_id: selectedClass });
      setAssignModalOpen(false);
      setSelectedClass('');
      setSelectedTrainer('');
      addToast('Trainer assigned successfully', 'success');
      loadData();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Assignment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this assignment?')) return;
    try {
      await assignmentsApi.delete(id);
      addToast('Assignment removed', 'success');
      loadData();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Removal failed', 'error');
    }
  };

  // Group assignments by class id
  const byClass = new Map<string, ClassAssignment[]>();
  for (const a of assignments) {
    if (!byClass.has(a.class_id)) byClass.set(a.class_id, []);
    byClass.get(a.class_id)!.push(a);
  }

  // Build class lookup
  const classMap = new Map<string, ClassItem>();
  for (const c of classes) classMap.set(c.id, c);

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Schedule & Assignments</h1>
        <Button onClick={() => setAssignModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Trainer
        </Button>
      </div>

      {/* Classes with no assignments */}
      {classes
        .filter(c => !byClass.has(c.id))
        .map(cls => (
          <Card key={cls.id} className="opacity-70">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{cls.name}</h3>
                {formatSchedule(cls.scheduled_time) && (
                  <p className="text-sm text-primary-600 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />{formatSchedule(cls.scheduled_time)}
                  </p>
                )}
              </div>
              <Badge variant="gray">No trainer assigned</Badge>
            </div>
          </Card>
        ))}

      {Array.from(byClass.entries()).map(([classId, classAssignments]) => {
        const cls = classMap.get(classId);
        const schedule = formatSchedule(cls?.scheduled_time);
        return (
          <Card key={classId}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{classAssignments[0].class?.name || cls?.name || classId}</h3>
                {schedule && (
                  <p className="text-sm text-primary-600 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />{schedule}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {classAssignments.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{a.trainer?.name}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(a.id)}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {assignments.length === 0 && classes.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-500">No assignments yet. Assign trainers to classes to get started.</p>
        </Card>
      )}

      {/* Assign Modal */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Trainer to Class">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">Select a class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
            <select
              value={selectedTrainer}
              onChange={e => setSelectedTrainer(e.target.value)}
              className="input-field"
            >
              <option value="">Select a trainer</option>
              {allTrainers.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} isLoading={submitting} disabled={!selectedClass || !selectedTrainer}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
