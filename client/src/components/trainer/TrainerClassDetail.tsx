import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, ClipboardList, Calendar } from 'lucide-react';
import { classesApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { StudentList } from '../students/StudentList';
import { AttendanceMarking } from '../students/AttendanceMarking';
import { AttendanceSummaryView } from '../students/AttendanceSummaryView';
import { AssessmentList } from '../assessments/AssessmentList';
import { ClassItem } from '../../types';

type Tab = 'students' | 'attendance' | 'assessments';

export function TrainerClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('students');

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
    { key: 'students', label: 'Students', icon: Users },
    { key: 'attendance', label: 'Attendance', icon: Calendar },
    { key: 'assessments', label: 'Assessments', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => navigate('/trainer/classes')}>
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

      {activeTab === 'students' && classId && <StudentList classId={classId} />}

      {activeTab === 'attendance' && classId && (
        <div className="space-y-6">
          <AttendanceMarking classId={classId} />
          <AttendanceSummaryView classId={classId} />
        </div>
      )}

      {activeTab === 'assessments' && classId && <AssessmentList classId={classId} canDelete={false} />}
    </div>
  );
}
