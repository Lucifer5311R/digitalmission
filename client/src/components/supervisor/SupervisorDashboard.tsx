import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Clock, Activity } from 'lucide-react';
import { sessionsApi, classesApi } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatTime, formatDuration, formatRelativeTime } from '../../utils/formatters';
import { Session } from '../../types';

export function SupervisorDashboard() {
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [sessionsRes, classesRes] = await Promise.all([
        sessionsApi.getAll({ startDate: today }),
        classesApi.getAll({ status: 'active' }),
      ]);
      setTodaySessions(sessionsRes.data.data || []);
      setTotalClasses(classesRes.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  const activeSessions = todaySessions.filter(s => s.status === 'active');
  const completedSessions = todaySessions.filter(s => s.status === 'completed');
  const totalHoursToday = completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Now</p>
              <p className="text-2xl font-bold">{activeSessions.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sessions Today</p>
              <p className="text-2xl font-bold">{todaySessions.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hours Today</p>
              <p className="text-2xl font-bold">{totalHoursToday.toFixed(1)}h</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Classes</p>
              <p className="text-2xl font-bold">{totalClasses}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Live Sessions</h2>
        {activeSessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No active sessions right now</p>
        ) : (
          <div className="space-y-3">
            {activeSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">{session.trainer?.name}</p>
                  <p className="text-sm text-gray-600">{session.class?.name}</p>
                </div>
                <div className="text-right">
                  <Badge variant="success">Active</Badge>
                  <p className="text-xs text-gray-500 mt-1">Since {formatTime(session.check_in_time)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Today's Completed */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Completed Today</h2>
        {completedSessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No completed sessions today</p>
        ) : (
          <div className="space-y-3">
            {completedSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{session.trainer?.name}</p>
                  <p className="text-sm text-gray-600">{session.class?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatDuration(session.duration_minutes)}</p>
                  <p className="text-xs text-gray-500">
                    {formatTime(session.check_in_time)} - {formatTime(session.check_out_time!)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
