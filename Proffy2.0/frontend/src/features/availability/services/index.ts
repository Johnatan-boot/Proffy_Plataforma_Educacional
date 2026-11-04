import { http } from '@/services/http';
import { Availability, ScheduleItemInput } from '../types';

export const availabilityService = {
  getByTeacherId: async (teacherId: string): Promise<Availability[]> => {
    return http.get<Availability[]>(`/availabilities/teacher/${teacherId}`);
  },

  create: async (teacherId: string, item: ScheduleItemInput): Promise<Availability> => {
    return http.post<Availability>('/availabilities', {
      teacherId,
      weekDay: Number(item.weekday),
      from: item.from,
      to: item.to,
    });
  },

  delete: async (id: string): Promise<void> => {
    return http.delete<void>(`/availabilities/${id}`);
  },

  // O backend só tem criar/excluir (sem PATCH), então "salvar os horários"
  // de um professor é: apagar os horários antigos e recriar os atuais.
  // Evita inventar um endpoint de update que o backend não tem.
  replaceAll: async (teacherId: string, items: ScheduleItemInput[]): Promise<void> => {
    const existing = await availabilityService.getByTeacherId(teacherId);
    await Promise.all(existing.map(a => availabilityService.delete(a.id)));

    const validItems = items.filter(i => i.weekday !== '' && i.from && i.to);
    await Promise.all(validItems.map(i => availabilityService.create(teacherId, i)));
  },
};
