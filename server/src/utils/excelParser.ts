import * as XLSX from 'xlsx';

export function parseExcelFile(filePath: string): any[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

export function parseStudentList(filePath: string): { register_no: string; name: string; email?: string; phone?: string }[] {
  const rows = parseExcelFile(filePath);
  return rows.map((row: any) => {
    // Normalize keys: lowercase + trim for case-insensitive matching
    const norm: Record<string, string> = {};
    for (const k of Object.keys(row)) {
      norm[k.toLowerCase().replace(/[\s_-]/g, '')] = String(row[k] ?? '').trim();
    }
    const register_no = (
      norm['registerno'] || norm['regno'] || norm['rollno'] || norm['rollnumber'] ||
      norm['studentid'] || norm['id'] || norm['sno'] || norm['slno'] || ''
    ).trim();
    const name = (
      norm['name'] || norm['studentname'] || norm['fullname'] || norm['studentfullname'] || ''
    ).trim();
    const email = norm['email'] || norm['emailid'] || undefined;
    const phone = norm['phone'] || norm['mobile'] || norm['phoneno'] || norm['mobileno'] || undefined;
    return { register_no, name, email: email || undefined, phone: phone || undefined };
  }).filter(s => s.register_no && s.name);
}

export function parseAttendanceSheet(filePath: string): { register_no: string; name: string; status: string; date?: string }[] {
  const rows = parseExcelFile(filePath);
  return rows.map((row: any) => {
    const norm: Record<string, string> = {};
    for (const k of Object.keys(row)) {
      norm[k.toLowerCase().replace(/[\s_-]/g, '')] = String(row[k] ?? '').trim();
    }
    const register_no = (
      norm['registerno'] || norm['regno'] || norm['rollno'] || norm['rollnumber'] || norm['studentid'] || ''
    ).trim();
    const name = (norm['name'] || norm['studentname'] || '').trim();
    const status = (norm['status'] || norm['attendance'] || norm['present'] || '').trim().toLowerCase();
    const date = norm['date'] || undefined;
    return { register_no, name, status, date };
  }).filter(s => s.register_no && s.name && s.status);
}
