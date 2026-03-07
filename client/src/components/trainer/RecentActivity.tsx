import React, { useEffect, useState } from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sessionsApi } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { formatDuration, formatDate, formatTime, formatDateTime } from '../../utils/formatters';
import { Session, Pagination } from '../../types';

const SessionCard = React.memo(function SessionCard({ session }: { session: Session }) {
  return (
    <Card padding="sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{session.class?.name || 'Unknown Class'}</h3>
            <Badge variant={session.status === 'active' ? 'success' : 'gray'} size="sm">
              {session.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(session.check_in_time)}
            </span>
            <span className="mx-2">•</span>
            {formatTime(session.check_in_time)}
            {session.check_out_time && ` - ${formatTime(session.check_out_time)}`}
          </p>
          {session.notes && session.notes.length > 0 && (
            <div className="mt-2 space-y-1">
              {session.notes.map(note => (
                <div key={note.id} className="flex items-start gap-1.5 text-sm text-gray-600">
                  <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{note.note_text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-gray-900">
            {session.duration_minutes ? formatDuration(session.duration_minutes) : '--'}
          </p>
        </div>
      </div>
    </Card>
  );
});

export function RecentActivity() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadSessions();
  }, [page]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await sessionsApi.getMySessions({ page, limit: 10 });
      setSessions(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 1) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Session History</h1>

      {sessions.length === 0 ? (
        <Card className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No sessions recorded yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm text-gray-600">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
