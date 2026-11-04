import { http } from '@/services/http';
import { Teacher, TeacherSearchParams } from '../types';

// Assim como em Students: criar um professor do zero (nome + e-mail + bio +
// valor da hora) equivale a um registro de usuário com perfil TEACHER.
// Reaproveitamos POST /auth/register (mesmo contrato da tela de Cadastro)
// gerando uma senha temporária, em vez de duplicar essa lógica no backend.
function generateTemporaryPassword() {
  return `Proffy@${Math.random().toString(36).slice(2, 10)}`;
}

interface TeacherFormPayload {
  name: string;
  email?: string;
  avatar?: string;
  whatsapp?: string;
  bio: string;
  subject: string; // subjectId
  cost: number | string;
}

export const teacherService = {
  create: async (data: TeacherFormPayload): Promise<Teacher> => {
    const result = await http.post<{ profile: { id: string } }>('/auth/register', {
      name: data.name,
      email: data.email,
      password: generateTemporaryPassword(),
      role: 'TEACHER',
      bio: data.bio,
      hourlyRate: Number(data.cost),
      ...(data.subject && { subjectId: data.subject }),
      ...(data.avatar && { avatar: data.avatar }),
      ...(data.whatsapp && { whatsapp: data.whatsapp }),
    });

    return http.get<Teacher>(`/teachers/${result.profile.id}`);
  },

  search: async (params: Partial<TeacherSearchParams>): Promise<Teacher[]> => {
    const all = await http.get<Teacher[]>('/teachers');

    return all.filter(t => {
      if (params.subject) {
        const matchSubject =
          t.subjectId === params.subject ||
          t.subject === params.subject ||
          (t.subjects ?? []).some(s => s.id === params.subject);
        if (!matchSubject) return false;
      }

      const hasWeekday = params.weekday !== undefined && params.weekday !== '';
      const hasTime = Boolean(params.time);

      if (hasWeekday || hasTime) {
        const slots = t.availabilities ?? [];
        return slots.some(a => {
          if (hasWeekday && a.weekDay !== Number(params.weekday)) return false;
          if (hasTime && !(a.from <= params.time! && params.time! < a.to)) return false;
          return true;
        });
      }

      return true;
    });
  },

  getTotal: async (): Promise<number> => {
    const all = await http.get<Teacher[]>('/teachers');
    return all.length;
  },

  getRecent: async (limit: number = 3): Promise<Teacher[]> => {
    const all = await http.get<Teacher[]>('/teachers');
    return all.slice(0, limit);
  },

  delete: async (id: string): Promise<void> => {
    return http.delete<void>(`/teachers/${id}`);
  },

  getById: async (id: string): Promise<Teacher | null> => {
    try {
      return await http.get<Teacher>(`/teachers/${id}`);
    } catch {
      return null;
    }
  },

  update: async (id: string, data: Partial<TeacherFormPayload>): Promise<Teacher> => {
    const payload: Record<string, unknown> = {};

    if (data.name) payload.name = data.name;
    if (data.avatar) payload.avatar = data.avatar;
    if (data.whatsapp) payload.whatsapp = data.whatsapp;
    if (data.bio) payload.bio = data.bio;
    if (data.subject) payload.subjectId = data.subject;
    if (data.cost !== undefined) payload.hourlyRate = Number(data.cost);

    return http.patch<Teacher>(`/teachers/${id}`, payload);
  }
};
