import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Plus, Edit, Trash2, Users, FileSpreadsheet } from 'lucide-react';
import { studentsApi, attendanceApi } from '../../services/api';
import { Student, AttendanceSummary, UserRole } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface StudentListProps {
  classId: string;
  className?: string;
}

const emptyForm = { register_no: '', name: '', email: '', phone: '' };

export function StudentList({ classId, className }: StudentListProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [summaryMap, setSummaryMap] = useState<Record<string, AttendanceSummary>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const isSupervisor = user?.role === UserRole.SUPERVISOR;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, summaryRes] = await Promise.all([
        studentsApi.getAll({ class_id: classId }),
        attendanceApi.getSummary(classId),
      ]);
      setStudents(studentsRes.data.data || []);
      const summaries: AttendanceSummary[] = summaryRes.data.data || [];
      const map: Record<string, AttendanceSummary> = {};
      summaries.forEach((s) => { map[s.student_id] = s; });
      setSummaryMap(map);
    } catch {
      addToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  }, [classId, addToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => { setEditingStudent(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({ register_no: s.register_no, name: s.name, email: s.email || '', phone: s.phone || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStudent) {
        await studentsApi.update(editingStudent.id, form);
        addToast('Student updated', 'success');
      } else {
        await studentsApi.create({ ...form, class_id: classId });
        addToast('Student added', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch {
      addToast(editingStudent ? 'Failed to update student' : 'Failed to add student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s: Student) => {
    if (!window.confirm(`Delete student "${s.name}"?`)) return;
    try {
      await studentsApi.delete(s.id);
      addToast('Student deleted', 'success');
      loadData();
    } catch {
      addToast('Failed to delete student', 'error');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await studentsApi.upload(classId, file);
      const { created, skipped } = res.data.data || { created: 0, skipped: 0 };
      addToast(`Uploaded: ${created} created, ${skipped} skipped`, 'success');
      loadData();
    } catch {
      addToast('Upload failed', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const pctBadge = (studentId: string) => {
    const s = summaryMap[studentId];
    if (!s) return <span className="text-gray-400">—</span>;
    const p = s.percentage;
    const variant = p >= 75 ? 'success' : p >= 60 ? 'warning' : 'danger';
    return <Badge variant={variant}>{p.toFixed(1)}%</Badge>;
  };

  if (loading) return <LoadingSpinner className="py-12" />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Students</h2>
          <Badge variant="info" size="sm">{students.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1" /> Upload
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Student
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <Card className="text-center py-8 text-gray-500">
          <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>No students yet. Add students or upload a file.</p>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Register No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.register_no}</td>
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{s.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{s.phone || '—'}</td>
                    <td className="px-4 py-3">{pctBadge(s.id)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" title="Edit">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        {isSupervisor && (
                          <button onClick={() => handleDelete(s)} className="p-2 hover:bg-red-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {students.map((s) => (
              <Card key={s.id} padding="sm">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.register_no}</p>
                    {s.email && <p className="text-xs text-gray-500 truncate">{s.email}</p>}
                    {s.phone && <p className="text-xs text-gray-500">{s.phone}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {pctBadge(s.id)}
                    <button onClick={() => openEdit(s)} className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    {isSupervisor && (
                      <button onClick={() => handleDelete(s)} className="p-2 hover:bg-red-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingStudent ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Register No" required value={form.register_no} onChange={(e) => setForm({ ...form, register_no: e.target.value })} />
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>{editingStudent ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
