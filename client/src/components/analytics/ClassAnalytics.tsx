import { useEffect, useState } from 'react';
import { analyticsApi } from '../../services/api';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Badge } from '../common/Badge';
import { BarChart2, TrendingUp, Award, Trophy, Users } from 'lucide-react';

interface ClassAnalyticsProps {
  classId: string;
  className?: string;
}

interface AssessmentStat {
  name: string;
  max_marks: number;
  average: number;
  highest: number;
  lowest: number;
  pass_count: number;
  fail_count: number;
}

interface TopStudent {
  name: string;
  register_no: string;
  average_percentage: number;
}

interface ClassPerformanceData {
  class_info: { name: string; total_students: number };
  assessment_stats: AssessmentStat[];
  top_students: TopStudent[];
  overall_average: number;
}

export function ClassAnalytics({ classId, className }: ClassAnalyticsProps) {
  const [data, setData] = useState<ClassPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getClassPerformance(classId);
        setData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-red-500">
        {error || 'No data available'}
      </div>
    );
  }

  const totalStudents = data.class_info?.total_students ?? 0;
  const totalAssessments = data.assessment_stats?.length ?? 0;
  const overallAverage = data.overall_average ?? 0;
  const totalPass = data.assessment_stats?.reduce((sum, a) => sum + a.pass_count, 0) ?? 0;
  const totalAttempts = data.assessment_stats?.reduce((sum, a) => sum + a.pass_count + a.fail_count, 0) ?? 0;
  const passRate = totalAttempts > 0 ? (totalPass / totalAttempts) * 100 : 0;

  const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const medalLabels = ['🥇', '🥈', '🥉'];

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{totalAssessments}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall Average</p>
              <p className="text-2xl font-bold text-gray-900">{overallAverage.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">{passRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Per-Assessment Breakdown */}
      {data.assessment_stats && data.assessment_stats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-gray-600" />
            Assessment Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.assessment_stats.map((assessment, index) => {
              const avgPct = assessment.max_marks > 0
                ? (assessment.average / assessment.max_marks) * 100
                : 0;
              const highPct = assessment.max_marks > 0
                ? (assessment.highest / assessment.max_marks) * 100
                : 0;

              return (
                <Card key={index} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{assessment.name}</h4>
                    <Badge variant="info">Max: {assessment.max_marks}</Badge>
                  </div>

                  {/* Average bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Average</span>
                      <span>{assessment.average.toFixed(1)} / {assessment.max_marks} ({avgPct.toFixed(1)}%)</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(avgPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Highest bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Highest</span>
                      <span>{assessment.highest} / {assessment.max_marks}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(highPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 text-sm">
                    <span className="text-gray-500">
                      Lowest: <span className="font-medium text-gray-700">{assessment.lowest}</span>
                    </span>
                    <span className="text-gray-500">
                      Pass: <span className="font-medium text-green-600">{assessment.pass_count}</span>
                    </span>
                    <span className="text-gray-500">
                      Fail: <span className="font-medium text-red-600">{assessment.fail_count}</span>
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Top 5 Students */}
      {data.top_students && data.top_students.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Students
          </h3>
          <Card className="divide-y divide-gray-100">
            {data.top_students.slice(0, 5).map((student, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 ${
                  index < 3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {index < 3 ? (
                      <span className={`text-xl ${medalColors[index]}`}>{medalLabels[index]}</span>
                    ) : (
                      <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.register_no}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 hidden sm:block">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${Math.min(student.average_percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-14 text-right">
                    {student.average_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
