import React, { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { reportsApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatDate, formatDuration, formatTime } from '../../utils/formatters';

export function SupervisorReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await reportsApi.getAttendance(params);
      setReportData(res.data.data || []);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await reportsApi.getAttendanceCsv(params);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const exportPdf = async () => {
    if (reportData.length === 0) return;
    setExportingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 297, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Attendance Management System', 14, 10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Trainer Session Report', 14, 17);

      // Date range
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      const dateRange = startDate || endDate
        ? `Period: ${startDate ? formatDate(startDate) : 'Beginning'} — ${endDate ? formatDate(endDate) : 'Today'}`
        : 'Period: All time';
      doc.text(dateRange, 14, 28);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 200, 28);

      // Summary stats
      const completed = reportData.filter(r => r.status === 'completed');
      const totalMinutes = completed.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
      const totalHours = (totalMinutes / 60).toFixed(1);
      const uniqueTrainers = new Set(reportData.map(r => r.trainer?.id)).size;
      const uniqueClasses = new Set(reportData.map(r => r.class?.id)).size;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      const stats = [
        `Total Sessions: ${reportData.length}`,
        `Completed: ${completed.length}`,
        `Total Hours: ${totalHours}h`,
        `Trainers: ${uniqueTrainers}`,
        `Classes: ${uniqueClasses}`,
      ];
      stats.forEach((s, i) => doc.text(s, 14 + i * 55, 35));

      // Table
      autoTable(doc, {
        startY: 40,
        head: [['Trainer', 'Class', 'Date', 'Check In', 'Check Out', 'Duration', 'Status']],
        body: reportData.map(row => [
          row.trainer?.name || '—',
          row.class?.name || '—',
          row.check_in_time ? formatDate(row.check_in_time) : '—',
          row.check_in_time ? formatTime(row.check_in_time) : '—',
          row.check_out_time ? formatTime(row.check_out_time) : '—',
          row.duration_minutes ? formatDuration(row.duration_minutes) : '—',
          row.status,
        ]),
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 },
          2: { cellWidth: 28 },
          3: { cellWidth: 22 },
          4: { cellWidth: 22 },
          5: { cellWidth: 22 },
          6: { cellWidth: 20 },
        },
        didDrawPage: (data) => {
          // Footer
          doc.setFontSize(7);
          doc.setTextColor(150);
          doc.text(
            `Page ${data.pageNumber}`,
            148,
            doc.internal.pageSize.getHeight() - 5,
            { align: 'center' }
          );
        },
      });

      const fileName = `attendance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  // Summary counts
  const completed = reportData.filter(r => r.status === 'completed').length;
  const active = reportData.filter(r => r.status === 'active').length;
  const totalHours = ((reportData.reduce((s, r) => s + (r.duration_minutes || 0), 0)) / 60).toFixed(1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadReport} isLoading={loading}>
              <FileText className="w-4 h-4 mr-2" /> Generate
            </Button>
            <Button variant="secondary" onClick={exportCsv} isLoading={exporting} disabled={reportData.length === 0}>
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="secondary" onClick={exportPdf} isLoading={exportingPdf} disabled={reportData.length === 0}>
              <Printer className="w-4 h-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary badges */}
      {reportData.length > 0 && !loading && (
        <div className="flex flex-wrap gap-3">
          <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
            <p className="text-2xl font-bold text-blue-700">{reportData.length}</p>
            <p className="text-xs text-blue-500">Total Sessions</p>
          </div>
          <div className="bg-green-50 rounded-lg px-4 py-2 text-center">
            <p className="text-2xl font-bold text-green-700">{completed}</p>
            <p className="text-xs text-green-500">Completed</p>
          </div>
          <div className="bg-yellow-50 rounded-lg px-4 py-2 text-center">
            <p className="text-2xl font-bold text-yellow-700">{active}</p>
            <p className="text-xs text-yellow-500">Active</p>
          </div>
          <div className="bg-purple-50 rounded-lg px-4 py-2 text-center">
            <p className="text-2xl font-bold text-purple-700">{totalHours}h</p>
            <p className="text-xs text-purple-500">Total Hours</p>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSpinner className="mt-8" />
      ) : reportData.length > 0 ? (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Trainer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Check In</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Check Out</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reportData.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.trainer?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.class?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{row.check_in_time ? formatDate(row.check_in_time) : '—'}</td>
                    <td className="px-4 py-3">{row.check_in_time ? formatTime(row.check_in_time) : '—'}</td>
                    <td className="px-4 py-3">{row.check_out_time ? formatTime(row.check_out_time) : '—'}</td>
                    <td className="px-4 py-3">{row.duration_minutes ? formatDuration(row.duration_minutes) : '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={row.status === 'completed' ? 'success' : 'warning'} size="sm">
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Select a date range and click Generate to view reports</p>
          <p className="text-xs text-gray-400 mt-1">Leave dates empty to see all records</p>
        </Card>
      )}
    </div>
  );
}
