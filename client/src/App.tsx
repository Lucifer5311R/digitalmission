import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { NotFound } from './pages/NotFound';
import { UserRole } from './types';

import { TrainerDashboard } from './components/trainer/TrainerDashboard';
import { AssignedClasses } from './components/trainer/AssignedClasses';
import { RecentActivity } from './components/trainer/RecentActivity';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { TrainersTab } from './components/supervisor/TrainersTab';
import { ClassesTab } from './components/supervisor/ClassesTab';
import { ScheduleTab } from './components/supervisor/ScheduleTab';
import { SupervisorReports } from './components/supervisor/SupervisorReports';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SyncProvider>
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
          </SyncProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
