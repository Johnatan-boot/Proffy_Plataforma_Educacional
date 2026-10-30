import { http } from '@/services/http';

export interface OverviewReport {
  totalLessons: number;
  activeLessons: number;
  byStatus: Record<string, number>;
  totalHours: number;
  totalCost: number;
  avgCostPerLesson: number;
  costBySubject: { name: string; lessons: number; cost: number }[];
  costByTeacher: { teacherId: string; name: string; lessons: number; hours: number; cost: number }[];
}

export const reportService = {
  overview: () => http.get<OverviewReport>('/reports/overview'),
};
