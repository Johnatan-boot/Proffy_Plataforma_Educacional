export interface ScheduleEntry {
  id: string;
  weekday: number; // 0 = Domingo ... 6 = Sábado
  from: string; // "HH:mm"
  to: string; // "HH:mm"
  subject: string;
  subjectColor: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  className: string; // turma
  room: string;
  // "aula" = agendamento real; "disponibilidade" = horário que o professor
  // cadastrou como disponível para lecionar.
  source?: "aula" | "disponibilidade";
  // Campos presentes apenas em aulas reais (source === "aula")
  subjectId?: string;
  studentId?: string;
  studentName?: string;
  status?: ScheduleStatus;
  scheduledAt?: string;
  duration?: number;
}

export type ScheduleStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export const STATUS_LABELS: Record<ScheduleStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
};

export interface CreateScheduleInput {
  teacherId: string;
  studentId: string;
  subjectId: string;
  scheduledAt: string; // ISO (UTC)
  duration: number; // minutos
  room?: string;
  className?: string;
}

export const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
