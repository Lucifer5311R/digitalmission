import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Clock, Activity, AlertTriangle, GraduationCap, ClipboardList, BarChart3 } from 'lucide-react';
import { sessionsApi, classesApi, analyticsApi } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatTime, formatDuration, formatRelativeTime } from '../../utils/formatters';
import { Session } from '../../types';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  total_trainers: number;
  total_students: number;
  total_classes: number;
  total_assignments: number;
  total_sessions: number;
  total_sessions_today: number;
  total_hours: number;
  active_sessions_now: number;
}

export function SupervisorDashboard() {
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
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

    // Load analytics stats (graceful degradation)
    try {
      const [dashRes, alertsRes] = await Promise.all([
        analyticsApi.getDashboardStats(),
        analyticsApi.getAttendanceAlerts(75),
      ]);
      setStats(dashRes.data.data || null);
      setAlertCount(Array.isArray(alertsRes.data.data) ? alertsRes.data.data.length : 0);
    } catch {
      // Analytics endpoint may not be available — show 0s
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  const activeSessions = todaySessions.filter(s => s.status === 'active');
  const completedSessions = todaySessions.filter(s => s.status === 'completed');
  const totalHoursToday = completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>

      {/* Today Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Now</p>
              <p className="text-2xl font-bold">{stats?.active_sessions_now ?? activeSessions.length}</p>
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
              <p className="text-2xl font-bold">{stats?.total_sessions_today ?? todaySessions.length}</p>
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
              <p className="text-2xl font-bold">{stats?.total_classes ?? totalClasses}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* All-time Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Trainers</p>
              <p className="text-2xl font-bold">{stats?.total_trainers ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold">{stats?.total_students ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assignments</p>
              <p className="text-2xl font-bold">{stats?.total_assignments ?? 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold">{stats?.total_sessions ?? 0}</p>
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

      {/* Attendance Alerts */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Attendance Alerts
          </h2>
          <button onClick={() => navigate('/supervisor/attendance-alerts')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {alertCount > 0
            ? <span className="text-amber-600 font-semibold">{alertCount} student{alertCount !== 1 ? 's' : ''}</span>
            : <span className="text-green-600 font-semibold">No students</span>
          } below 75% attendance threshold.
        </p>
      </Card>
    </div>
  );
}
