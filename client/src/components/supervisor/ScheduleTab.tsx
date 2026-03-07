import React, { useEffect, useState } from 'react';
import { Plus, X, UserPlus } from 'lucide-react';
import { assignmentsApi, classesApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ClassAssignment, ClassItem } from '../../types';

export function ScheduleTab() {
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [assignRes, classesRes] = await Promise.all([
        assignmentsApi.getAll(),
        classesApi.getAll({ status: 'active' }),
      ]);
      setAssignments(assignRes.data.data || []);
      setClasses(classesRes.data.data || []);
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
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this assignment?')) return;
    try {
      await assignmentsApi.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Removal failed');
    }
  };

  // Group by class
  const byClass = new Map<string, ClassAssignment[]>();
  for (const a of assignments) {
    const key = a.class?.name || a.class_id;
    if (!byClass.has(key)) byClass.set(key, []);
    byClass.get(key)!.push(a);
  }

  // Get unique trainers for assignment modal
  const trainerMap = new Map<string, any>();
  for (const a of assignments) {
    if (a.trainer) trainerMap.set(a.trainer.id, a.trainer);
  }

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

      {Array.from(byClass.entries()).map(([className, classAssignments]) => (
        <Card key={className}>
          <h3 className="font-semibold text-lg mb-3">{className}</h3>
          <div className="space-y-2">
            {classAssignments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{a.trainer?.name}</p>
                  <p className="text-xs text-gray-500">{a.trainer?.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(a.id)}>
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {assignments.length === 0 && (
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
              {Array.from(trainerMap.values()).map((t: any) => (
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
