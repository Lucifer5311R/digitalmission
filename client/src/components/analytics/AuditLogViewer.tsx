import { useEffect, useState, useCallback } from 'react';
import { auditLogsApi } from '../../services/api';
import { AuditLogEntry } from '../../types';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Search, Filter, Clock, FileText } from 'lucide-react';

interface AuditLogViewerProps {
  entityType?: string;
  entityId?: string;
}

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'mark_update', label: 'Mark Update' },
  { value: 'attendance_update', label: 'Attendance Update' },
  { value: 'profile_update', label: 'Profile Update' },
  { value: 'delete', label: 'Delete' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'assessment_mark', label: 'Assessment Mark' },
  { value: 'student_attendance', label: 'Student Attendance' },
  { value: 'user', label: 'User' },
];

const actionBadgeVariant: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'gray'> = {
  mark_update: 'info',
  attendance_update: 'success',
  profile_update: 'gray',
  delete: 'danger',
};

const formatChange = (old_value: any, new_value: any): string => {
  if (!old_value && new_value) return `Created: ${JSON.stringify(new_value)}`;
  if (old_value && !new_value) return `Deleted`;
  const changes: string[] = [];
  for (const key of Object.keys(new_value || {})) {
    if (old_value?.[key] !== new_value?.[key]) {
      changes.push(`${key}: ${old_value?.[key] ?? '—'} → ${new_value[key]}`);
    }
  }
  return changes.length > 0 ? changes.join(', ') : 'No changes';
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function AuditLogViewer({ entityType, entityId }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState(entityType || '');
  const [searchUser, setSearchUser] = useState('');
  const limit = 15;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit };
      if (actionFilter) params.action = actionFilter;
      if (entityTypeFilter) params.entity_type = entityTypeFilter;
      if (entityId) params.entity_id = entityId;
      const response = await auditLogsApi.getAll(params);
      const resData = response.data.data;
      setLogs(resData.audit_logs || resData.logs || resData || []);
      const pagination = resData.pagination || response.data.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages || Math.ceil(pagination.total / limit));
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityTypeFilter, entityId, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [actionFilter, entityTypeFilter]);

  const filteredLogs = searchUser
    ? logs.filter((log) =>
        log.user?.name?.toLowerCase().includes(searchUser.toLowerCase())
      )
    : logs;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <Input
              placeholder="Search by user name..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              disabled={!!entityType}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
            >
              {ENTITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No audit log entries found</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Timestamp</th>
                <th className="px-4 py-3 font-medium text-gray-600">User</th>
                <th className="px-4 py-3 font-medium text-gray-600">Action</th>
                <th className="px-4 py-3 font-medium text-gray-600">Entity Type</th>
                <th className="px-4 py-3 font-medium text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(log.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                    {log.user?.name || 'System'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={actionBadgeVariant[log.action] || 'gray'}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {log.entity_type.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={formatChange(log.old_value, log.new_value)}>
                    {formatChange(log.old_value, log.new_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
