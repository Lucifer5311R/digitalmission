import { useState, useEffect, useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import { marksApi } from '../../services/api';
import { AssessmentMark } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

interface StudentMarksViewProps {
  studentId: string;
  studentName?: string;
}

export function StudentMarksView({ studentId, studentName }: StudentMarksViewProps) {
  const [marks, setMarks] = useState<AssessmentMark[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await marksApi.getByStudent(studentId);
        setMarks(res.data.data || []);
      } catch {
        addToast('Failed to load student marks', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, addToast]);

  const overallAverage = useMemo(() => {
    if (marks.length === 0) return null;
    const totalPct = marks.reduce((sum, m) => {
      const max = m.assessment?.max_marks || 100;
      return sum + (m.marks_obtained / max) * 100;
    }, 0);
    return (totalPct / marks.length).toFixed(1);
  }, [marks]);

  const getPercentageBadge = (obtained: number, max: number) => {
    const pct = (obtained / max) * 100;
    const variant = pct >= 75 ? 'success' : pct >= 40 ? 'warning' : 'danger';
    return <Badge variant={variant} size="sm">{pct.toFixed(1)}%</Badge>;
  };

  if (loading) return <LoadingSpinner className="py-8" />;

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">{studentName ? `${studentName} — Marks` : 'Student Marks'}</h3>
          </div>
          {overallAverage && (
            <div className="text-sm">
              <span className="text-gray-600">Overall Average:</span>{' '}
              <span className="font-semibold text-gray-900">{overallAverage}%</span>
            </div>
          )}
        </div>
      </div>

      {marks.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No marks recorded for this student.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Assessment</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Max Marks</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Obtained</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Percentage</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m) => {
                const max = m.assessment?.max_marks || 100;
                return (
                  <tr key={m.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-900 font-medium">{m.assessment?.name || '—'}</td>
                    <td className="px-4 py-2.5 text-center text-gray-600">{max}</td>
                    <td className="px-4 py-2.5 text-center font-semibold text-gray-900">{m.marks_obtained}</td>
                    <td className="px-4 py-2.5 text-center">{getPercentageBadge(m.marks_obtained, max)}</td>
                    <td className="px-4 py-2.5 text-gray-500">{m.remarks || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
