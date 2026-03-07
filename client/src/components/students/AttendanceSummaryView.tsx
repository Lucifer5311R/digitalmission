import React, { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import { attendanceApi } from '../../services/api';
import { AttendanceSummary } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Card } from '../common/Card';

interface AttendanceSummaryViewProps {
  classId: string;
}

export function AttendanceSummaryView({ classId }: AttendanceSummaryViewProps) {
  const { addToast } = useToast();
  const [data, setData] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await attendanceApi.getSummary(classId);
      const items: AttendanceSummary[] = res.data.data || [];
      items.sort((a, b) => a.percentage - b.percentage);
      setData(items);
    } catch {
      addToast('Failed to load attendance summary', 'error');
    } finally {
      setLoading(false);
    }
  }, [classId, addToast]);

  useEffect(() => { load(); }, [load]);

  const pctBadge = (p: number) => {
    const variant = p >= 75 ? 'success' : p >= 60 ? 'warning' : 'danger';
    return <Badge variant={variant}>{p.toFixed(1)}%</Badge>;
  };

  if (loading) return <LoadingSpinner className="py-12" />;

  if (data.length === 0) {
    return (
      <Card className="text-center py-8 text-gray-500">
        <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
        <p>No attendance data available.</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900">Attendance Summary</h2>
        <Badge variant="info" size="sm">{data.length}</Badge>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto border rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Register No</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 text-center">Total</th>
              <th className="px-4 py-3 text-center">Present</th>
              <th className="px-4 py-3 text-center">Absent</th>
              <th className="px-4 py-3 text-center">Late</th>
              <th className="px-4 py-3 text-center">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((s, i) => (
              <tr key={s.student_id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-4 py-3 font-medium">{s.register_no}</td>
                <td className="px-4 py-3">{s.student_name}</td>
                <td className="px-4 py-3 text-center">{s.total_classes}</td>
                <td className="px-4 py-3 text-center text-green-600 font-medium">{s.present}</td>
                <td className="px-4 py-3 text-center text-red-600 font-medium">{s.absent}</td>
                <td className="px-4 py-3 text-center text-amber-600 font-medium">{s.late}</td>
                <td className="px-4 py-3 text-center">{pctBadge(s.percentage)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {data.map((s) => (
          <Card key={s.student_id} padding="sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">{s.student_name}</p>
                <p className="text-xs text-gray-500">{s.register_no}</p>
              </div>
              {pctBadge(s.percentage)}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>Total: {s.total_classes}</span>
              <span className="text-green-600">P: {s.present}</span>
              <span className="text-red-600">A: {s.absent}</span>
              <span className="text-amber-600">L: {s.late}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
