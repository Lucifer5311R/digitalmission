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
  phone?: string;
  profile_photo?: string;
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

export interface ClassSchedule {
  days: string[];
  start_time: string;
  end_time: string;
}

export interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  scheduled_time: ClassSchedule | null;
  location: string | null;
  capacity: number | null;
  status: 'active' | 'inactive' | 'archived';
  created_by: string;
  creator?: { id: string; name: string };
  teacher_name?: string;
  teacher_contact?: string;
  cr_name?: string;
  cr_contact?: string;
  assignments?: ClassAssignment[];
  students?: Student[];
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

export interface Student {
  id: string;
  register_no: string;
  name: string;
  email?: string;
  phone?: string;
  class_id: string;
  status: 'active' | 'inactive';
  class?: ClassItem;
  created_at: string;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  class_id: string;
  session_id?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  marked_by: string;
  student?: Student;
  marker?: User;
  created_at: string;
}

export interface Assessment {
  id: string;
  class_id: string;
  name: string;
  max_marks: number;
  weightage?: number;
  created_by: string;
  creator?: User;
  marks?: AssessmentMark[];
  created_at: string;
}

export interface AssessmentMark {
  id: string;
  assessment_id: string;
  student_id: string;
  marks_obtained: number;
  remarks?: string;
  updated_by: string;
  student?: Student;
  assessment?: Assessment;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSummary {
  student_id: string;
  student_name: string;
  register_no: string;
  total_classes: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: any;
  new_value: any;
  ip_address?: string;
  user?: User;
  created_at: string;
}
