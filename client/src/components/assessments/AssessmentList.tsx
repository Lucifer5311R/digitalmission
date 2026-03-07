import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { assessmentsApi } from '../../services/api';
import { Assessment } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { MarksGrid } from './MarksGrid';

interface AssessmentListProps {
  classId: string;
  className?: string;
  canDelete?: boolean;
}

export function AssessmentList({ classId, className, canDelete = false }: AssessmentListProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [activeMarksGrid, setActiveMarksGrid] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', max_marks: '', weightage: '' });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await assessmentsApi.getAll(classId);
      setAssessments(res.data.data || []);
    } catch {
      addToast('Failed to load assessments', 'error');
    } finally {
      setLoading(false);
    }
  }, [classId, addToast]);

  useEffect(() => { loadAssessments(); }, [loadAssessments]);

  const openAddModal = () => {
    setEditingAssessment(null);
    setForm({ name: '', max_marks: '', weightage: '' });
    setModalOpen(true);
  };

  const openEditModal = (a: Assessment) => {
    setEditingAssessment(a);
    setForm({ name: a.name, max_marks: String(a.max_marks), weightage: a.weightage ? String(a.weightage) : '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.max_marks) { addToast('Name and max marks are required', 'warning'); return; }
    setSaving(true);
    try {
      const payload = {
        class_id: classId,
        name: form.name,
        max_marks: Number(form.max_marks),
        ...(form.weightage ? { weightage: Number(form.weightage) } : {}),
      };
      if (editingAssessment) {
        await assessmentsApi.update(editingAssessment.id, payload);
        addToast('Assessment updated', 'success');
      } else {
        await assessmentsApi.create(payload);
        addToast('Assessment created', 'success');
      }
      setModalOpen(false);
      loadAssessments();
    } catch {
      addToast('Failed to save assessment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assessment? All associated marks will be lost.')) return;
    try {
      await assessmentsApi.delete(id);
      addToast('Assessment deleted', 'success');
      if (activeMarksGrid === id) setActiveMarksGrid(null);
      loadAssessments();
    } catch {
      addToast('Failed to delete assessment', 'error');
    }
  };

  if (loading) return <LoadingSpinner className="py-12" />;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Assessments</h2>
          <Badge variant="info" size="sm">{assessments.length}</Badge>
        </div>
        <Button size="sm" onClick={openAddModal}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button>
      </div>

      {assessments.length === 0 ? (
        <Card className="text-center text-gray-500 py-8">
          <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>No assessments yet. Create one to start entering marks.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((a) => (
            <div key={a.id}>
              <Card className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{a.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Max Marks: {a.max_marks}</p>
                    {a.weightage != null && <p className="text-sm text-gray-500">Weightage: {a.weightage}%</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(a)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    {canDelete && (
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={activeMarksGrid === a.id ? 'secondary' : 'primary'}
                  onClick={() => setActiveMarksGrid(activeMarksGrid === a.id ? null : a.id)}
                  className="w-full"
                >
                  {activeMarksGrid === a.id ? 'Hide Marks Grid' : 'Enter Marks'}
                </Button>
              </Card>
              {activeMarksGrid === a.id && (
                <div className="mt-2">
                  <MarksGrid
                    assessmentId={a.id}
                    assessmentName={a.name}
                    maxMarks={a.max_marks}
                    classId={classId}
                    onClose={() => setActiveMarksGrid(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAssessment ? 'Edit Assessment' : 'Add Assessment'}>
        <div className="space-y-4">
          <Input label="Assessment Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mid-term Exam" required />
          <Input label="Maximum Marks" type="number" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: e.target.value })} placeholder="100" min="1" required />
          <Input label="Weightage (%)" type="number" value={form.weightage} onChange={(e) => setForm({ ...form, weightage: e.target.value })} placeholder="Optional" min="0" max="100" helperText="Leave blank if not applicable" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>{editingAssessment ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
