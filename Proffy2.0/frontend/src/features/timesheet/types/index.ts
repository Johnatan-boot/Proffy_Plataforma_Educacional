export type AttendanceStatus = "presente" | "atrasado" | "ausente" | "em_andamento" | "concluido";

export interface TimeEntry {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  subject: string;
  date: string; // ISO date (yyyy-mm-dd)
  clockIn: string | null; // "HH:mm"
  clockOut: string | null; // "HH:mm"
  expectedIn: string; // "HH:mm"
  expectedOut: string; // "HH:mm"
  status: AttendanceStatus;
}

export interface MonthlySummary {
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  hoursWorked: number;
  hoursExpected: number;
  absences: number;
  lateArrivals: number;
}
