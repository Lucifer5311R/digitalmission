import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { analyticsApi } from '../../services/api';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AlertStudent {
  student_id: string;
  register_no: string;
  student_name: string;
  class_name: string;
  present: number;
  total: number;
  percentage: number;
}

export function AttendanceAlertsPage() {
  const [threshold, setThreshold] = useState('75');
  const [alerts, setAlerts] = useState<AlertStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async (t?: number) => {
    setLoading(true);
    try {
      const res = await analyticsApi.getAttendanceAlerts(t ?? (parseInt(threshold) || 75));
      setAlerts(res.data.data || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAlerts(75); }, []);

  const rowColor = (pct: number) => {
    if (pct < 50) return 'bg-red-50 text-red-900';
    if (pct < 75) return 'bg-amber-50 text-amber-900';
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" /> Attendance Alerts
        </h1>
        <div className="flex items-center gap-2">
          <Input
            label=""
            type="number"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            placeholder="Threshold %"
            className="w-28"
          />
          <Button size="sm" onClick={() => loadAlerts()}>Apply</Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner className="mt-10" size="lg" />
      ) : alerts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No students below {threshold}% attendance threshold.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4">Reg No</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Class</th>
                <th className="pb-2 pr-4 text-right">Present/Total</th>
                <th className="pb-2 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(s => (
                <tr key={s.student_id} className={`border-b last:border-0 ${rowColor(s.percentage)}`}>
                  <td className="py-2 pr-4 font-mono">{s.register_no}</td>
                  <td className="py-2 pr-4">{s.student_name}</td>
                  <td className="py-2 pr-4">{s.class_name}</td>
                  <td className="py-2 pr-4 text-right">{s.present}/{s.total}</td>
                  <td className="py-2 text-right font-semibold">{s.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
