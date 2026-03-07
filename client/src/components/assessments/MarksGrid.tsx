import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Save, X, BarChart2 } from 'lucide-react';
import { marksApi, studentsApi } from '../../services/api';
import { Student, AssessmentMark } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

interface MarksGridProps {
  assessmentId: string;
  assessmentName: string;
  maxMarks: number;
  classId: string;
  onClose?: () => void;
}

interface MarkEntry {
  marks_obtained: string;
  remarks: string;
  existingId?: string;
  original_marks: string;
  original_remarks: string;
}

export function MarksGrid({ assessmentId, assessmentName, maxMarks, classId, onClose }: MarksGridProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, MarkEntry>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const marksInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, marksRes] = await Promise.all([
        studentsApi.getAll({ class_id: classId }),
        marksApi.getByAssessment(assessmentId),
      ]);
      const studentList: Student[] = studentsRes.data.data || [];
      const marksList: AssessmentMark[] = marksRes.data.data || [];

      const existingMarks: Record<string, AssessmentMark> = {};
      marksList.forEach((m) => { existingMarks[m.student_id] = m; });

      const initialMap: Record<string, MarkEntry> = {};
      studentList.forEach((s) => {
        const existing = existingMarks[s.id];
        const marksVal = existing ? String(existing.marks_obtained) : '';
        const remarksVal = existing?.remarks || '';
        initialMap[s.id] = {
          marks_obtained: marksVal,
          remarks: remarksVal,
          existingId: existing?.id,
          original_marks: marksVal,
          original_remarks: remarksVal,
        };
      });

      setStudents(studentList.sort((a, b) => a.register_no.localeCompare(b.register_no)));
      setMarksMap(initialMap);
    } catch {
      addToast('Failed to load marks data', 'error');
    } finally {
      setLoading(false);
    }
  }, [classId, assessmentId, addToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateMark = (studentId: string, field: 'marks_obtained' | 'remarks', value: string) => {
    setMarksMap((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  };

  const stats = useMemo(() => {
    let entered = 0, total = 0, passCount = 0, failCount = 0;
    Object.values(marksMap).forEach((entry) => {
      if (entry.marks_obtained !== '') {
        const val = parseFloat(entry.marks_obtained);
        if (!isNaN(val) && val >= 0 && val <= maxMarks) {
          entered++;
          total += val;
          if (val >= maxMarks * 0.4) passCount++; else failCount++;
        }
      }
    });
    return {
      entered,
      total: students.length,
      average: entered > 0 ? (total / entered).toFixed(1) : '—',
      passCount,
      failCount,
    };
  }, [marksMap, students.length, maxMarks]);

  const changedEntries = useMemo(() => {
    return students.filter((s) => {
      const entry = marksMap[s.id];
      if (!entry || entry.marks_obtained === '') return false;
      return entry.marks_obtained !== entry.original_marks || entry.remarks !== entry.original_remarks;
    });
  }, [marksMap, students]);

  const hasInvalid = useMemo(() => {
    return students.some((s) => {
      const val = marksMap[s.id]?.marks_obtained;
      if (val === '' || val === undefined) return false;
      const num = parseFloat(val);
      return isNaN(num) || num < 0 || num > maxMarks;
    });
  }, [marksMap, students, maxMarks]);

  const handleSave = async () => {
    if (hasInvalid) { addToast('Fix invalid marks before saving', 'warning'); return; }
    if (changedEntries.length === 0) { addToast('No changes to save', 'info'); return; }
    setSaving(true);
    try {
      const marks = changedEntries.map((s) => ({
        student_id: s.id,
        marks_obtained: parseFloat(marksMap[s.id].marks_obtained),
        ...(marksMap[s.id].remarks ? { remarks: marksMap[s.id].remarks } : {}),
      }));
      await marksApi.bulkUpsert({ assessment_id: assessmentId, marks });
      addToast(`${marks.length} mark(s) saved successfully`, 'success');
      loadData();
    } catch {
      addToast('Failed to save marks', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatus = (entry?: MarkEntry) => {
    if (!entry || entry.marks_obtained === '') return 'gray';
    const val = parseFloat(entry.marks_obtained);
    if (isNaN(val) || val < 0 || val > maxMarks) return 'invalid';
    return val >= maxMarks * 0.4 ? 'green' : 'red';
  };

  const statusColors: Record<string, string> = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-300',
    invalid: 'bg-yellow-500',
  };

  if (loading) return <LoadingSpinner className="py-8" />;

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-gray-900">{assessmentName}</h3>
            <p className="text-sm text-gray-500">Max Marks: {maxMarks}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} isLoading={saving} disabled={changedEntries.length === 0 || hasInvalid}>
              <Save className="w-4 h-4 mr-1" />Save ({changedEntries.length})
            </Button>
            {onClose && (
              <Button size="sm" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <BarChart2 className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Entered:</span>
            <span className="font-medium">{stats.entered}/{stats.total}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Average:</span>{' '}
            <span className="font-medium">{stats.average}</span>
          </div>
          <Badge variant="success" size="sm">Pass: {stats.passCount}</Badge>
          <Badge variant="danger" size="sm">Fail: {stats.failCount}</Badge>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-10">#</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600">Reg No</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600">Student Name</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-32">Marks</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-48">Remarks</th>
              <th className="text-center px-4 py-2.5 font-medium text-gray-600 w-12">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const entry = marksMap[student.id];
              const status = getStatus(entry);
              const isInvalid = status === 'invalid';
              const marksVal = entry?.marks_obtained ?? '';

              return (
                <tr key={student.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-700">{student.register_no}</td>
                  <td className="px-4 py-2 text-gray-900">{student.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <input
                        ref={(el) => { marksInputRefs.current[student.id] = el; }}
                        type="number"
                        min={0}
                        max={maxMarks}
                        step="0.5"
                        value={marksVal}
                        onChange={(e) => updateMark(student.id, 'marks_obtained', e.target.value)}
                        className={`w-20 px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                          isInvalid
                            ? 'border-red-400 focus:ring-red-300 bg-red-50'
                            : 'border-gray-300 focus:ring-primary-300 focus:border-primary-400'
                        }`}
                        placeholder="—"
                      />
                      <span className="text-xs text-gray-400">/{maxMarks}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={entry?.remarks ?? ''}
                      onChange={(e) => updateMark(student.id, 'remarks', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
                      placeholder="Optional"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-block w-3 h-3 rounded-full ${statusColors[status]}`} title={
                      status === 'green' ? 'Pass' : status === 'red' ? 'Fail' : status === 'invalid' ? 'Invalid' : 'Not entered'
                    } />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="text-center text-gray-500 py-8">No students found in this class.</div>
        )}
      </div>
    </Card>
  );
}
