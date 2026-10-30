import { prisma } from "../../lib/prisma";

export interface OverviewReport {
  totalLessons: number;
  activeLessons: number;
  byStatus: Record<string, number>;
  totalHours: number;
  totalCost: number;
  avgCostPerLesson: number;
  costBySubject: { name: string; lessons: number; cost: number }[];
  costByTeacher: {
    teacherId: string;
    name: string;
    lessons: number;
    hours: number;
    cost: number;
  }[];
}

// Custos reais derivados do que já existe no banco: cada aula (não cancelada)
// custa `hourlyRate do professor × duração em horas`. Faturamento não é
// calculado aqui porque o modelo não possui valor cobrado do aluno.
export class ReportService {
  async overview(): Promise<OverviewReport> {
    const schedules = await prisma.schedule.findMany({
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    const byStatus: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      CANCELLED: 0,
      COMPLETED: 0,
    };

    const subjects = new Map<string, { name: string; lessons: number; cost: number }>();
    const teachers = new Map<
      string,
      { teacherId: string; name: string; lessons: number; hours: number; cost: number }
    >();

    let totalHours = 0;
    let totalCost = 0;
    let activeLessons = 0;

    for (const s of schedules) {
      byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;

      if (s.status === "CANCELLED") continue;

      const hours = s.duration / 60;
      const cost = Number(s.teacher.hourlyRate) * hours;

      activeLessons += 1;
      totalHours += hours;
      totalCost += cost;

      const sub = subjects.get(s.subject.id) ?? { name: s.subject.name, lessons: 0, cost: 0 };
      sub.lessons += 1;
      sub.cost += cost;
      subjects.set(s.subject.id, sub);

      const t = teachers.get(s.teacher.id) ?? {
        teacherId: s.teacher.id,
        name: s.teacher.user.name,
        lessons: 0,
        hours: 0,
        cost: 0,
      };
      t.lessons += 1;
      t.hours += hours;
      t.cost += cost;
      teachers.set(s.teacher.id, t);
    }

    const round = (n: number) => Math.round(n * 100) / 100;

    return {
      totalLessons: schedules.length,
      activeLessons,
      byStatus,
      totalHours: round(totalHours),
      totalCost: round(totalCost),
      avgCostPerLesson: activeLessons ? round(totalCost / activeLessons) : 0,
      costBySubject: Array.from(subjects.values())
        .map((x) => ({ ...x, cost: round(x.cost) }))
        .sort((a, b) => b.cost - a.cost),
      costByTeacher: Array.from(teachers.values())
        .map((x) => ({ ...x, hours: round(x.hours), cost: round(x.cost) }))
        .sort((a, b) => b.cost - a.cost),
    };
  }
}
