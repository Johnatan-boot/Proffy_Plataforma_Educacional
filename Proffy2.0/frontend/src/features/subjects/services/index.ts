import { http } from '@/services/http';
import { Subject } from '../types';

export const subjectService = {
  getAll: async (): Promise<Subject[]> => {
    return http.get<Subject[]>('/subjects');
  },

  getById: async (id: string): Promise<Subject | undefined> => {
    try {
      return await http.get<Subject>(`/subjects/${id}`);
    } catch {
      return undefined;
    }
  },

  getByName: async (name: string): Promise<Subject | undefined> => {
    const subjects = await http.get<Subject[]>('/subjects');
    return subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
  },

  create: async (data: { name: string }): Promise<Subject> => {
    return http.post<Subject>('/subjects', data);
  },

  update: async (id: string, data: { name: string }): Promise<Subject> => {
    return http.patch<Subject>(`/subjects/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return http.delete<void>(`/subjects/${id}`);
  }
};
