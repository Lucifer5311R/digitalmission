# Backend API Documentation

Base URL: `http://localhost:3001/api`

All endpoints return JSON. Protected endpoints require `Authorization: Bearer <token>` header.

## Authentication

### POST /api/auth/login
Login with email and password.
```json
// Request
{ "email": "admin@attendance.com", "password": "admin123" }

// Response 200
{
  "token": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": { "id": "uuid", "name": "Admin", "email": "admin@attendance.com", "role": "supervisor" }
}
```

### POST /api/auth/refresh
Refresh access token.
```json
// Request
{ "refreshToken": "eyJhbG..." }
// Response 200
{ "token": "eyJhbG...", "refreshToken": "eyJhbG..." }
```

### POST /api/auth/logout
Invalidate refresh token. **Requires auth.**
```json
// Response 200
{ "message": "Logged out successfully" }
```

### GET /api/auth/me
Get current user profile. **Requires auth.**

---

## Classes

### GET /api/classes
List all classes. **Requires auth.** Query: `?status=active&page=1&limit=20`

### POST /api/classes
Create a class. **Supervisor only.**
```json
{ "name": "Yoga 101", "description": "Beginner yoga", "scheduledTime": "Mon/Wed 9:00 AM", "location": "Room A", "capacity": 20 }
```

### PUT /api/classes/:id
Update a class. **Supervisor only.**

### DELETE /api/classes/:id
Delete a class. **Supervisor only.**

### GET /api/classes/:id/stats
Get class statistics (session count, total hours, trainer count). **Supervisor only.**

---

## Assignments

### POST /api/assignments
Assign trainer to class. **Supervisor only.**
```json
{ "trainerId": "uuid", "classId": "uuid" }
```

### GET /api/assignments
List assignments. Supervisors see all; trainers see own. Query: `?classId=uuid&trainerId=uuid`

### GET /api/assignments/trainer/:id
Get classes assigned to a specific trainer. **Requires auth.**

### DELETE /api/assignments/:id
Remove assignment. **Supervisor only.**

---

## Sessions

### POST /api/sessions/checkin
Start a session. **Trainer only.** Must be assigned to the class.
```json
{ "classId": "uuid" }
```

### POST /api/sessions/:id/checkout
End a session. **Trainer only.** Auto-calculates `duration_minutes`.

### GET /api/sessions/my-sessions
Get current trainer's sessions. Query: `?startDate=2024-01-01&endDate=2024-12-31`

### GET /api/sessions
List all sessions. **Supervisor only.** Query: `?trainerId=uuid&classId=uuid&page=1&limit=20`

---

## Session Notes

### POST /api/sessions/:id/notes
Add note to a session. **Requires auth.**
```json
{ "noteText": "Great session, covered all material." }
```

### GET /api/sessions/:id/notes
Get notes for a session. **Requires auth.**

### DELETE /api/sessions/:id/notes/:noteId
Delete a note. **Owner only.**

---

## Ratings

### POST /api/ratings
Rate a trainer. **Supervisor only.**
```json
{ "trainerId": "uuid", "rating": 5, "feedbackText": "Excellent teaching!" }
```

### GET /api/ratings/trainer/:id
Get all ratings for a trainer. **Requires auth.**

### GET /api/trainers/:id/stats
Get trainer statistics (avg rating, total hours, session count). **Requires auth.**

---

## Reports

### GET /api/reports/attendance
Attendance report. **Supervisor only.** Query: `?format=csv&startDate=2024-01-01&endDate=2024-12-31`
- `format=json` (default) or `format=csv`

### GET /api/reports/trainer/:id
Individual trainer report. **Supervisor only.**

### GET /api/reports/class/:id
Class report. **Supervisor only.**

---

## Sync (Offline)

### POST /api/sync
Submit offline changes for processing. **Requires auth.**
```json
{
  "changes": [
    { "type": "checkin", "data": { "classId": "uuid", "timestamp": "2024-01-01T09:00:00Z" } },
    { "type": "checkout", "data": { "sessionId": "uuid", "timestamp": "2024-01-01T10:30:00Z" } }
  ]
}
```

### GET /api/sync/status
Get sync status for current user. **Requires auth.**

---

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "message": "Descriptive error message",
    "code": "VALIDATION_ERROR",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

| Status | Description |
|--------|-------------|
| 400 | Validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 429 | Rate limited |
| 500 | Internal server error |

## Database Schema

7 tables: `users`, `classes`, `class_assignments`, `sessions`, `session_notes`, `trainer_ratings`, `sync_logs`

All tables use UUID primary keys for offline-first compatibility. See `server/src/models/` for full schema definitions.
