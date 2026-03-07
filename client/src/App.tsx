import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { UserRole } from './types';

const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const TrainerDashboard = React.lazy(() => import('./components/trainer/TrainerDashboard').then(m => ({ default: m.TrainerDashboard })));
const AssignedClasses = React.lazy(() => import('./components/trainer/AssignedClasses').then(m => ({ default: m.AssignedClasses })));
const RecentActivity = React.lazy(() => import('./components/trainer/RecentActivity').then(m => ({ default: m.RecentActivity })));
const SupervisorDashboard = React.lazy(() => import('./components/supervisor/SupervisorDashboard').then(m => ({ default: m.SupervisorDashboard })));
const TrainersTab = React.lazy(() => import('./components/supervisor/TrainersTab').then(m => ({ default: m.TrainersTab })));
const ClassesTab = React.lazy(() => import('./components/supervisor/ClassesTab').then(m => ({ default: m.ClassesTab })));
const ScheduleTab = React.lazy(() => import('./components/supervisor/ScheduleTab').then(m => ({ default: m.ScheduleTab })));
const SupervisorReports = React.lazy(() => import('./components/supervisor/SupervisorReports').then(m => ({ default: m.SupervisorReports })));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SyncProvider>
          <ToastProvider>
          <ToastContainer />
          <Suspense fallback={<LoadingSpinner className="mt-20" size="lg" />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Trainer Routes */}
            <Route
              path="/trainer"
              element={
                <ProtectedRoute allowedRoles={[UserRole.TRAINER]}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TrainerDashboard />} />
              <Route path="classes" element={<AssignedClasses />} />
              <Route path="sessions" element={<RecentActivity />} />
            </Route>

            {/* Supervisor Routes */}
            <Route
              path="/supervisor"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SUPERVISOR]}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SupervisorDashboard />} />
              <Route path="trainers" element={<TrainersTab />} />
              <Route path="classes" element={<ClassesTab />} />
              <Route path="schedule" element={<ScheduleTab />} />
              <Route path="reports" element={<SupervisorReports />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ToastProvider>
          </SyncProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
