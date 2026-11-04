import { http } from '@/services/http';
import { ScheduleEntry, ScheduleStatus, CreateScheduleInput } from '../types';
import { Teacher } from '@/features/teachers/types';

const SUBJECT_COLORS: Record<string, string> = {
  "Matemática": "#8257E5",
  "Português": "#04D361",
  "Química": "#FFB84D",
  "Física": "#3D8EE3",
  "Biologia": "#E33D3D",
  "História": "#B75CFF",
  "Geografia": "#00B0AE",
  "Artes": "#FF6BAA",
  "Educação Física": "#F2994A",
  "Ciências": "#2ECC71",
  "Programação": "#774DD6",
};

const FALLBACK_COLORS = ["#8257E5", "#04D361", "#FFB84D", "#3D8EE3", "#E33D3D", "#B75CFF", "#00B0AE", "#FF6BAA"];

function colorForSubject(subject: string): string {
  if (SUBJECT_COLORS[subject]) return SUBJECT_COLORS[subject];
  // Disciplinas que não estão na paleta fixa recebem uma cor estável
  // derivada do próprio nome, para não ficarem todas cinzas.
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

interface BackendScheduleEntry {
  id: string;
  subject: string;
  subjectId: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  studentId: string;
  studentName: string;
  className: string;
  room: string;
  status: ScheduleStatus;
  scheduledAt: string;
  duration: number;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Dia da semana e horários são derivados de `scheduledAt` no fuso do
// NAVEGADOR (e não do servidor, que costuma rodar em UTC em produção).
function toScheduleEntry(raw: BackendScheduleEntry): ScheduleEntry {
  const start = new Date(raw.scheduledAt);
  const end = new Date(start.getTime() + raw.duration * 60 * 1000);

  return {
    id: raw.id,
    weekday: start.getDay(),
    from: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    to: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
    subject: raw.subject,
    subjectColor: colorForSubject(raw.subject),
    subjectId: raw.subjectId,
    teacherId: raw.teacherId,
    teacherName: raw.teacherName,
    teacherAvatar: raw.teacherAvatar,
    studentId: raw.studentId,
    studentName: raw.studentName,
    className: raw.className,
    room: raw.room,
    status: raw.status,
    scheduledAt: raw.scheduledAt,
    duration: raw.duration,
    source: 'aula',
  };
}

// Converte a disponibilidade cadastrada pelo professor (dia + faixa de hora)
// em uma entrada da grade. Assim a tela de Horários mostra os dias e horários
// em que cada professor leciona mesmo quando ainda não há aulas agendadas.
function availabilitiesToEntries(teachers: Teacher[]): ScheduleEntry[] {
  return teachers.flatMap(t =>
    (t.availabilities ?? []).map(a => ({
      id: `av-${a.id}`,
      weekday: a.weekDay,
      from: a.from,
      to: a.to,
      subject: t.subject || 'Sem disciplina',
      subjectColor: colorForSubject(t.subject || 'Sem disciplina'),
      teacherId: t.id,
      teacherName: t.name,
      teacherAvatar: t.avatar || undefined,
      className: '',
      room: '',
      source: 'disponibilidade' as const,
    }))
  );
}

export const scheduleService = {
  getAll: async (): Promise<ScheduleEntry[]> => {
    const [raw, teachers] = await Promise.all([
      http.get<BackendScheduleEntry[]>('/schedules'),
      http.get<Teacher[]>('/teachers'),
    ]);

    const lessons = raw.map(toScheduleEntry);
    const availability = availabilitiesToEntries(teachers);

    return [...lessons, ...availability].sort((a, b) => a.from.localeCompare(b.from));
  },

  // Somente aulas reais (agendamentos), sem as disponibilidades dos professores.
  getLessons: async (): Promise<ScheduleEntry[]> => {
    const raw = await http.get<BackendScheduleEntry[]>('/schedules');
    return raw.map(toScheduleEntry);
  },

  create: async (data: CreateScheduleInput): Promise<void> => {
    await http.post('/schedules', {
      ...data,
      room: data.room || undefined,
      className: data.className || undefined,
    });
  },

  updateStatus: async (id: string, status: ScheduleStatus): Promise<void> => {
    await http.patch(`/schedules/${id}`, { status });
  },

  delete: async (id: string): Promise<void> => {
    await http.delete<void>(`/schedules/${id}`);
  },

  getClassNames: async (): Promise<string[]> => {
    const entries = await scheduleService.getAll();
    return Array.from(new Set(entries.map(s => s.className)));
  },

  getTimeSlots: async (): Promise<string[]> => {
    const entries = await scheduleService.getAll();
    return Array.from(new Set(entries.map(s => s.from))).sort();
  },
};
