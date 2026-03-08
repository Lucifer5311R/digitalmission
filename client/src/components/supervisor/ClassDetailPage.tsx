import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, ClipboardList, Calendar, Phone, User, Clock } from 'lucide-react';
import { classesApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { StudentList } from '../students/StudentList';
import { AttendanceMarking } from '../students/AttendanceMarking';
import { AttendanceSummaryView } from '../students/AttendanceSummaryView';
import { AssessmentList } from '../assessments/AssessmentList';
import { ClassItem, ClassSchedule } from '../../types';

function formatSchedule(s: ClassSchedule | null | undefined): string | null {
  if (!s || (!s.days?.length && !s.start_time)) return null;
  const days = s.days?.join(', ') || '';
  const time = s.start_time ? `${s.start_time}${s.end_time ? ` – ${s.end_time}` : ''}` : '';
  return [days, time].filter(Boolean).join('  •  ');
}

type Tab = 'overview' | 'students' | 'attendance' | 'assessments';

export function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!classId) return;
    classesApi.getById(classId)
      .then(res => setCls(res.data.data))
      .catch(() => setCls(null))
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;
  if (!cls) return <p className="text-center mt-20 text-gray-500">Class not found.</p>;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: BookOpen },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'attendance', label: 'Attendance', icon: Calendar },
    { key: 'assessments', label: 'Assessments', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate('/supervisor/classes')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{cls.name}</h1>
          <Badge variant={cls.status === 'active' ? 'success' : 'gray'}>{cls.status}</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="font-semibold mb-3">Class Info</h3>
            <div className="space-y-2 text-sm">
              {cls.description && <p className="text-gray-600">{cls.description}</p>}
              {cls.location && <p><span className="text-gray-500">Location:</span> {cls.location}</p>}
              {cls.capacity && <p><span className="text-gray-500">Capacity:</span> {cls.capacity}</p>}
              {formatSchedule(cls.scheduled_time) && (
                <div className="flex items-center gap-1.5 text-primary-700 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>{formatSchedule(cls.scheduled_time)}</span>
                </div>
              )}
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold mb-3">Contacts</h3>
            <div className="space-y-2 text-sm">
              {cls.teacher_name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Teacher: {cls.teacher_name}</span>
                  {cls.teacher_contact && <span className="flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3" />{cls.teacher_contact}</span>}
                </div>
              )}
              {cls.cr_name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>CR: {cls.cr_name}</span>
                  {cls.cr_contact && <span className="flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3" />{cls.cr_contact}</span>}
                </div>
              )}
              {!cls.teacher_name && !cls.cr_name && <p className="text-gray-400">No contacts set.</p>}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'students' && classId && <StudentList classId={classId} />}

      {activeTab === 'attendance' && classId && (
        <div className="space-y-6">
          <AttendanceMarking classId={classId} />
          <AttendanceSummaryView classId={classId} />
        </div>
      )}

      {activeTab === 'assessments' && classId && <AssessmentList classId={classId} canDelete={true} />}
    </div>
  );
}
