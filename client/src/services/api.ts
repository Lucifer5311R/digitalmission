import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import { ApiResponse } from '../types';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor: attach token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 with refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

function processQueue(error: any, token: string | null) {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { token, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse>('/auth/login', { email, password }),
  logout: () => api.post<ApiResponse>('/auth/logout'),
  refresh: (refreshToken: string) =>
    api.post<ApiResponse>('/auth/refresh', { refreshToken }),
  me: () => api.get<ApiResponse>('/auth/me'),
};

// Classes API
export const classesApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse>('/classes', { params }),
  getById: (id: string) => api.get<ApiResponse>(`/classes/${id}`),
  create: (data: { name: string; description?: string; scheduled_time?: object; location?: string; capacity?: number }) =>
    api.post<ApiResponse>('/classes', data),
  update: (id: string, data: any) => api.put<ApiResponse>(`/classes/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/classes/${id}`),
  getStats: (id: string) => api.get<ApiResponse>(`/classes/${id}/stats`),
};

// Assignments API
export const assignmentsApi = {
  getAll: () => api.get<ApiResponse>('/assignments'),
  getByTrainer: (trainerId: string) =>
    api.get<ApiResponse>(`/assignments/trainer/${trainerId}`),
  create: (data: { trainer_id: string; class_id: string }) =>
    api.post<ApiResponse>('/assignments', data),
  delete: (id: string) => api.delete<ApiResponse>(`/assignments/${id}`),
};

// Sessions API
export const sessionsApi = {
  checkin: (classId: string) =>
    api.post<ApiResponse>('/sessions/checkin', { class_id: classId }),
  checkout: (sessionId: string) =>
    api.post<ApiResponse>(`/sessions/${sessionId}/checkout`),
  getMySessions: (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse>('/sessions/my-sessions', { params }),
  getAll: (params?: { startDate?: string; endDate?: string; trainer_id?: string; class_id?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse>('/sessions', { params }),
  getActive: () => api.get<ApiResponse>('/sessions/active'),
};

// Notes API
export const notesApi = {
  create: (sessionId: string, noteText: string) =>
    api.post<ApiResponse>(`/sessions/${sessionId}/notes`, { note_text: noteText }),
  getBySession: (sessionId: string) =>
    api.get<ApiResponse>(`/sessions/${sessionId}/notes`),
  delete: (sessionId: string, noteId: string) =>
    api.delete<ApiResponse>(`/sessions/${sessionId}/notes/${noteId}`),
};

// Ratings API
export const ratingsApi = {
  create: (data: { trainer_id: string; rating: number; feedback_text?: string }) =>
    api.post<ApiResponse>('/ratings', data),
  getByTrainer: (trainerId: string) =>
    api.get<ApiResponse>(`/ratings/trainer/${trainerId}`),
};

// Trainers API
export const trainersApi = {
  getStats: (trainerId: string) =>
    api.get<ApiResponse>(`/trainers/${trainerId}/stats`),
};

export const usersApi = {
  getByRole: (role: 'trainer' | 'supervisor') =>
    api.get<ApiResponse>(`/users?role=${role}`),
  createTrainer: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse>('/users', data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/users/${id}`),
};

// Reports API
export const reportsApi = {
  getAttendance: (params?: { startDate?: string; endDate?: string; format?: string }) =>
    api.get<ApiResponse>('/reports/attendance', { params }),
  getAttendanceCsv: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/attendance', { params: { ...params, format: 'csv' }, responseType: 'blob' }),
  getTrainerReport: (trainerId: string) =>
    api.get<ApiResponse>(`/reports/trainer/${trainerId}`),
  getClassReport: (classId: string) =>
    api.get<ApiResponse>(`/reports/class/${classId}`),
};

// Sync API
export const syncApi = {
  sync: (changes: any[]) => api.post<ApiResponse>('/sync', { changes }),
  getStatus: () => api.get<ApiResponse>('/sync/status'),
};

// Profile API
export const profileApi = {
  get: () => api.get<ApiResponse>('/profile'),
  update: (data: { name?: string; email?: string; phone?: string; password?: string; current_password?: string }) =>
    api.put<ApiResponse>('/profile', data),
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post<ApiResponse>('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Students API
export const studentsApi = {
  getAll: (params?: { class_id?: string; status?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse>('/students', { params }),
  getById: (id: string) => api.get<ApiResponse>(`/students/${id}`),
  create: (data: { register_no: string; name: string; email?: string; phone?: string; class_id: string }) =>
    api.post<ApiResponse>('/students', data),
  update: (id: string, data: any) => api.put<ApiResponse>(`/students/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/students/${id}`),
  upload: (classId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('class_id', classId);
    return api.post<ApiResponse>('/students/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Student Attendance API
export const attendanceApi = {
  mark: (data: { class_id: string; date: string; records: { student_id: string; status: string }[] }) =>
    api.post<ApiResponse>('/attendance', data),
  getByClassAndDate: (classId: string, date: string) =>
    api.get<ApiResponse>('/attendance', { params: { class_id: classId, date } }),
  getByStudent: (studentId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiResponse>(`/attendance/student/${studentId}`, { params }),
  getSummary: (classId: string) =>
    api.get<ApiResponse>('/attendance/summary', { params: { class_id: classId } }),
  upload: (classId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('class_id', classId);
    return api.post<ApiResponse>('/attendance/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Assessments API
export const assessmentsApi = {
  getAll: (classId: string) => api.get<ApiResponse>('/assessments', { params: { class_id: classId } }),
  getById: (id: string) => api.get<ApiResponse>(`/assessments/${id}`),
  create: (data: { class_id: string; name: string; max_marks: number; weightage?: number }) =>
    api.post<ApiResponse>('/assessments', data),
  update: (id: string, data: any) => api.put<ApiResponse>(`/assessments/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/assessments/${id}`),
};

// Marks API
export const marksApi = {
  getByAssessment: (assessmentId: string) => api.get<ApiResponse>(`/marks/assessment/${assessmentId}`),
  getByStudent: (studentId: string) => api.get<ApiResponse>(`/marks/student/${studentId}`),
  bulkUpsert: (data: { assessment_id: string; marks: { student_id: string; marks_obtained: number; remarks?: string }[] }) =>
    api.post<ApiResponse>('/marks', data),
  update: (id: string, data: { marks_obtained: number; remarks?: string }) =>
    api.put<ApiResponse>(`/marks/${id}`, data),
};

// Analytics API
export const analyticsApi = {
  getClassPerformance: (classId: string) => api.get<ApiResponse>(`/analytics/class/${classId}`),
  getAttendanceAlerts: (threshold?: number) =>
    api.get<ApiResponse>('/analytics/attendance-alerts', { params: { threshold } }),
  getDashboardStats: () => api.get<ApiResponse>('/analytics/dashboard'),
};

// Audit Logs API
export const auditLogsApi = {
  getAll: (params?: { entity_type?: string; entity_id?: string; user_id?: string; action?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse>('/audit-logs', { params }),
};

export default api;
