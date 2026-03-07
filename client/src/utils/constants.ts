export const API_BASE_URL = '/api';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'attendance_access_token',
  REFRESH_TOKEN: 'attendance_refresh_token',
  USER: 'attendance_user',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  TRAINER_HOME: '/trainer',
  SUPERVISOR_HOME: '/supervisor',
} as const;
