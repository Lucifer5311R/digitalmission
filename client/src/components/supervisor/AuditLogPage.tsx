import { AuditLogViewer } from '../analytics/AuditLogViewer';

export function AuditLogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
      <AuditLogViewer />
    </div>
  );
}
