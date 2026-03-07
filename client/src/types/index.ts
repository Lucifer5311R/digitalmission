export enum UserRole {
  TRAINER = 'trainer',
  SUPERVISOR = 'supervisor',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: string;
  created_at?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  scheduled_time: { day?: string; time?: string } | null;
  location: string | null;
  capacity: number | null;
  status: 'active' | 'inactive' | 'archived';
  created_by: string;
  creator?: { id: string; name: string };
  assignments?: ClassAssignment[];
  created_at: string;
  updated_at: string;
}

export interface ClassAssignment {
  id: string;
  trainer_id: string;
  class_id: string;
  assigned_date: string;
  is_active: boolean;
  assigned_by: string;
  trainer?: User;
  class?: ClassItem;
  assignedByUser?: { id: string; name: string };
  created_at: string;
}

export interface Session {
  id: string;
  trainer_id: string;
  class_id: string;
  check_in_time: string;
  check_out_time: string | null;
  duration_minutes: number | null;
  status: 'active' | 'completed';
  trainer?: User;
  class?: ClassItem;
  notes?: SessionNote[];
  created_at: string;
}

export interface SessionNote {
  id: string;
  session_id: string;
  note_text: string;
  created_by: string;
  author?: User;
  created_at: string;
}

export interface TrainerRating {
  id: string;
  trainer_id: string;
  rated_by: string;
  rating: number;
  feedback_text: string | null;
  rater?: { id: string; name: string };
  rated_at: string;
  created_at: string;
}

export interface TrainerStats {
  trainer: User;
  stats: {
    averageRating: number | null;
    totalRatings: number;
    totalSessions: number;
    totalHours: number;
  };
}

export interface ClassStats {
  classId: string;
  className: string;
  activeTrainers: number;
  totalSessions: number;
  totalHours: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SyncStatus {
  lastSync: string | null;
  lastSyncStatus: string | null;
  pendingChanges: number;
}
