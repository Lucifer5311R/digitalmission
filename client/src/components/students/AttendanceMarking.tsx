import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, Clock, Upload, FileSpreadsheet, Users } from 'lucide-react';
import { studentsApi, attendanceApi } from '../../services/api';
import { Student, StudentAttendance } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AttendanceMarkingProps {
  classId: string;
  className?: string;
}

type Status = 'present' | 'absent' | 'late';

const todayStr = () => new Date().toISOString().split('T')[0];

export function AttendanceMarking({ classId, className }: AttendanceMarkingProps) {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(todayStr);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      const res = await studentsApi.getAll({ class_id: classId });
      setStudents(res.data.data || []);
    } catch {
      addToast('Failed to load students', 'error');
    }
  }, [classId, addToast]);

  const loadExistingAttendance = useCallback(async () => {
    try {
      const res = await attendanceApi.getByClassAndDate(classId, date);
      const existing: StudentAttendance[] = res.data.data || [];
      if (existing.length > 0) {
        const map: Record<string, Status> = {};
        existing.forEach((a) => { map[a.student_id] = a.status; });
        setRecords(map);
      } else {
        // Default all to present
        const map: Record<string, Status> = {};
        students.forEach((s) => { map[s.id] = 'present'; });
        setRecords(map);
      }
    } catch {
      // Default all to present on error
      const map: Record<string, Status> = {};
      students.forEach((s) => { map[s.id] = 'present'; });
      setRecords(map);
    }
  }, [classId, date, students, addToast]);

  useEffect(() => {
    setLoading(true);
    loadStudents().finally(() => setLoading(false));
  }, [loadStudents]);

  useEffect(() => {
    if (students.length > 0) loadExistingAttendance();
  }, [students, date, loadExistingAttendance]);

  const setStatus = (studentId: string, status: Status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: Status) => {
    const map: Record<string, Status> = {};
    students.forEach((s) => { map[s.id] = status; });
    setRecords(map);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = students.map((s) => ({
        student_id: s.id,
        status: records[s.id] || 'present',
      }));
      await attendanceApi.mark({ class_id: classId, date, records: data });
      addToast('Attendance saved', 'success');
    } catch {
      addToast('Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await attendanceApi.upload(classId, file);
      const msg = res.data.message || 'Attendance uploaded';
      addToast(msg, 'success');
      loadExistingAttendance();
    } catch {
      addToast('Attendance upload failed', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const statusBtn = (studentId: string, status: Status) => {
    const current = records[studentId] || 'present';
    const isActive = current === status;

    const styles: Record<Status, { active: string; inactive: string; icon: React.ReactNode; label: string }> = {
      present: {
        active: 'bg-green-500 text-white ring-2 ring-green-300',
        inactive: 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600',
        icon: <Check className="w-4 h-4" />,
        label: 'P',
      },
      absent: {
        active: 'bg-red-500 text-white ring-2 ring-red-300',
        inactive: 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600',
        icon: <X className="w-4 h-4" />,
        label: 'A',
      },
      late: {
        active: 'bg-amber-500 text-white ring-2 ring-amber-300',
        inactive: 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600',
        icon: <Clock className="w-4 h-4" />,
        label: 'L',
      },
    };

    const s = styles[status];

    return (
      <button
        type="button"
        onClick={() => setStatus(studentId, status)}
        className={`flex items-center justify-center gap-1 rounded-lg font-medium text-sm min-h-[44px] min-w-[44px] px-3 transition-all ${isActive ? s.active : s.inactive}`}
        title={status.charAt(0).toUpperCase() + status.slice(1)}
      >
        {s.icon}
        <span className="hidden sm:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </button>
    );
  };

  const presentCount = Object.values(records).filter((v) => v === 'present').length;
  const absentCount = Object.values(records).filter((v) => v === 'absent').length;
  const lateCount = Object.values(records).filter((v) => v === 'late').length;

  if (loading) return <LoadingSpinner className="py-12" />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Mark Attendance</h2>
          {className && <span className="text-sm text-gray-500">— {className}</span>}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field text-sm min-h-[44px] px-3"
          />
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1" /> Upload
          </Button>
        </div>
      </div>

      {/* Quick actions & summary */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="secondary" size="sm" onClick={() => markAll('present')}>
          <Check className="w-4 h-4 mr-1 text-green-600" /> All Present
        </Button>
        <Button variant="secondary" size="sm" onClick={() => markAll('absent')}>
          <X className="w-4 h-4 mr-1 text-red-600" /> All Absent
        </Button>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <Badge variant="success">{presentCount} P</Badge>
          <Badge variant="danger">{absentCount} A</Badge>
          <Badge variant="warning">{lateCount} L</Badge>
        </div>
      </div>

      {students.length === 0 ? (
        <Card className="text-center py-8 text-gray-500">
          <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>No students in this class.</p>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto border rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 w-32">Register No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.register_no}</td>
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {statusBtn(s.id, 'present')}
                        {statusBtn(s.id, 'absent')}
                        {statusBtn(s.id, 'late')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {students.map((s) => (
              <Card key={s.id} padding="sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.register_no}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {statusBtn(s.id, 'present')}
                    {statusBtn(s.id, 'absent')}
                    {statusBtn(s.id, 'late')}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Save button */}
      {students.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} isLoading={saving} size="lg">
            <Check className="w-5 h-5 mr-2" /> Save Attendance
          </Button>
        </div>
      )}
    </div>
  );
}
