import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Star, Play } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sessionsApi, trainersApi } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useTimer } from '../../hooks/useTimer';
import { formatDuration, formatTime } from '../../utils/formatters';
import { Session, TrainerStats } from '../../types';

export function TrainerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TrainerStats['stats'] | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const elapsed = useTimer(activeSession?.check_in_time || null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [statsRes, activeRes, sessionsRes] = await Promise.all([
        trainersApi.getStats(user!.id),
        sessionsApi.getActive(),
        sessionsApi.getMySessions({ startDate: today }),
      ]);
      setStats(statsRes.data.data?.stats || null);
      setActiveSession(activeRes.data.data || null);
      setTodaySessions(sessionsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  const todayMinutes = todaySessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-600">Here's your attendance overview</p>
      </div>

      {/* Active Session Banner */}
      {activeSession && (
        <Card className="bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="font-semibold text-primary-900">Active Session</p>
                <p className="text-sm text-primary-700">{activeSession.class?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-primary-900">{elapsed}</p>
              <Badge variant="success">In Progress</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-xl font-bold">{formatDuration(todayMinutes)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-xl font-bold">{stats?.totalHours || 0}h</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-xl font-bold">{stats?.totalSessions || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Rating</p>
              <p className="text-xl font-bold">{stats?.averageRating?.toFixed(1) || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Sessions */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Today's Sessions</h2>
        {todaySessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No sessions today</p>
        ) : (
          <div className="space-y-3">
            {todaySessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{session.class?.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatTime(session.check_in_time)}
                    {session.check_out_time && ` - ${formatTime(session.check_out_time)}`}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={session.status === 'active' ? 'success' : 'gray'}>
                    {session.status === 'active' ? 'Active' : formatDuration(session.duration_minutes)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
