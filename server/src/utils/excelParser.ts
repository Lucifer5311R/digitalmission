import * as XLSX from 'xlsx';

export function parseExcelFile(filePath: string): any[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

export function parseStudentList(filePath: string): { register_no: string; name: string; email?: string; phone?: string }[] {
  const rows = parseExcelFile(filePath);
  return rows.map((row: any) => ({
    register_no: String(row['Register No'] || row['register_no'] || row['RegNo'] || row['Reg No'] || '').trim(),
    name: String(row['Name'] || row['name'] || row['Student Name'] || '').trim(),
    email: row['Email'] || row['email'] || undefined,
    phone: row['Phone'] || row['phone'] || undefined,
  })).filter(s => s.register_no && s.name);
}

export function parseAttendanceSheet(filePath: string): { register_no: string; name: string; status: string; date?: string }[] {
  const rows = parseExcelFile(filePath);
  return rows.map((row: any) => ({
    register_no: String(row['Register No'] || row['register_no'] || row['RegNo'] || row['Reg No'] || '').trim(),
    name: String(row['Name'] || row['name'] || row['Student Name'] || '').trim(),
    status: String(row['Status'] || row['status'] || row['Attendance'] || '').trim().toLowerCase(),
    date: row['Date'] || row['date'] || undefined,
  })).filter(s => s.register_no && s.name && s.status);
}
