import { TimeEntry, MonthlySummary } from '../types';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function nowHM() {
  return new Date().toTimeString().slice(0, 5);
}

function diffHours(from: string, to: string) {
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  return Math.max(0, (th * 60 + tm - (fh * 60 + fm)) / 60);
}

// Ponto eletrônico mockado em memória — pronto para ser substituído pela
// integração real com o backend (endpoints /timesheet/clock-in|clock-out).
let MOCK_ENTRIES: TimeEntry[] = [
  { id: "t1", teacherId: "1", teacherName: "Diego Fernandes", teacherAvatar: "https://github.com/diego3g.png", subject: "Química", date: todayISO(), clockIn: "08:58", clockOut: "12:05", expectedIn: "09:00", expectedOut: "12:00", status: "concluido" },
  { id: "t2", teacherId: "2", teacherName: "Mayk Brito", teacherAvatar: "https://github.com/maykbrito.png", subject: "Programação", date: todayISO(), clockIn: "08:00", clockOut: null, expectedIn: "08:00", expectedOut: "11:00", status: "em_andamento" },
  { id: "t3", teacherId: "3", teacherName: "Renata Alves", teacherAvatar: "https://i.pravatar.cc/150?u=renata", subject: "Matemática", date: todayISO(), clockIn: "07:14", clockOut: null, expectedIn: "07:00", expectedOut: "11:00", status: "atrasado" },
  { id: "t4", teacherId: "4", teacherName: "Bruno Costa", teacherAvatar: "https://i.pravatar.cc/150?u=brunoc", subject: "Português", date: todayISO(), clockIn: null, clockOut: null, expectedIn: "08:00", expectedOut: "11:00", status: "ausente" },
  { id: "t5", teacherId: "5", teacherName: "Felipe Martins", teacherAvatar: "https://i.pravatar.cc/150?u=felipe", subject: "Educação Física", date: todayISO(), clockIn: "09:58", clockOut: null, expectedIn: "10:00", expectedOut: "12:00", status: "presente" },
  { id: "t6", teacherId: "6", teacherName: "Camila Rocha", teacherAvatar: "https://i.pravatar.cc/150?u=camila", subject: "Física", date: todayISO(), clockIn: "06:55", clockOut: "10:02", expectedIn: "07:00", expectedOut: "10:00", status: "concluido" },
  { id: "t7", teacherId: "7", teacherName: "Patrícia Lima", teacherAvatar: "https://i.pravatar.cc/150?u=patricia", subject: "Biologia", date: todayISO(), clockIn: null, clockOut: null, expectedIn: "13:00", expectedOut: "16:00", status: "ausente" },
  { id: "t8", teacherId: "8", teacherName: "Fernanda Dias", teacherAvatar: "https://i.pravatar.cc/150?u=fernanda", subject: "História", date: todayISO(), clockIn: "07:02", clockOut: "10:00", expectedIn: "07:00", expectedOut: "10:00", status: "concluido" },
];

const MOCK_MONTHLY_SUMMARY: MonthlySummary[] = [
  { teacherId: "1", teacherName: "Diego Fernandes", teacherAvatar: "https://github.com/diego3g.png", hoursWorked: 62, hoursExpected: 64, absences: 0, lateArrivals: 1 },
  { teacherId: "2", teacherName: "Mayk Brito", teacherAvatar: "https://github.com/maykbrito.png", hoursWorked: 58, hoursExpected: 60, absences: 1, lateArrivals: 0 },
  { teacherId: "3", teacherName: "Renata Alves", teacherAvatar: "https://i.pravatar.cc/150?u=renata", hoursWorked: 70, hoursExpected: 76, absences: 0, lateArrivals: 3 },
  { teacherId: "4", teacherName: "Bruno Costa", teacherAvatar: "https://i.pravatar.cc/150?u=brunoc", hoursWorked: 60, hoursExpected: 76, absences: 2, lateArrivals: 1 },
  { teacherId: "5", teacherName: "Felipe Martins", teacherAvatar: "https://i.pravatar.cc/150?u=felipe", hoursWorked: 48, hoursExpected: 48, absences: 0, lateArrivals: 0 },
  { teacherId: "6", teacherName: "Camila Rocha", teacherAvatar: "https://i.pravatar.cc/150?u=camila", hoursWorked: 66, hoursExpected: 68, absences: 0, lateArrivals: 1 },
];

export const timesheetService = {
  getToday: async (): Promise<TimeEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_ENTRIES];
  },

  clockIn: async (id: string): Promise<TimeEntry> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_ENTRIES.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Registro não encontrado.");
    const time = nowHM();
    const isLate = time > MOCK_ENTRIES[index].expectedIn;
    MOCK_ENTRIES[index] = { ...MOCK_ENTRIES[index], clockIn: time, status: isLate ? "atrasado" : "presente" };
    return MOCK_ENTRIES[index];
  },

  clockOut: async (id: string): Promise<TimeEntry> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_ENTRIES.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Registro não encontrado.");
    MOCK_ENTRIES[index] = { ...MOCK_ENTRIES[index], clockOut: nowHM(), status: "concluido" };
    return MOCK_ENTRIES[index];
  },

  getMonthlySummary: async (): Promise<MonthlySummary[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_MONTHLY_SUMMARY];
  },

  computeWorkedHours: (entry: TimeEntry) => {
    if (!entry.clockIn || !entry.clockOut) return 0;
    return diffHours(entry.clockIn, entry.clockOut);
  },
};
