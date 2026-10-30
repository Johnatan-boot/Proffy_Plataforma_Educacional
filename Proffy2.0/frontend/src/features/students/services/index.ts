import { http } from '@/services/http';
import { Student } from '../types';

// O backend modela "criar um aluno" como registrar um novo usuário com
// perfil STUDENT (POST /students exige um userId já existente — é usado
// para vincular um perfil a um usuário, não para cadastrar uma pessoa nova).
// Por isso, ao criar um aluno pelo painel administrativo, geramos uma senha
// temporária e reaproveitamos o endpoint de registro (mesmo contrato usado
// pela tela de Cadastro), evitando duplicar lógica de criação de usuário.
function generateTemporaryPassword() {
  return `Proffy@${Math.random().toString(36).slice(2, 10)}`;
}

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    return http.get<Student[]>('/students');
  },

  getById: async (id: string): Promise<Student | null> => {
    try {
      return await http.get<Student>(`/students/${id}`);
    } catch {
      return null;
    }
  },

  create: async (data: Omit<Student, 'id' | 'createdAt'>): Promise<Student> => {
    const session = await http.post<{ profile: { id: string } }>('/auth/register', {
      name: data.name,
      email: data.email,
      password: generateTemporaryPassword(),
      role: 'STUDENT',
      ...(data.avatar && { avatar: data.avatar }),
      ...(data.whatsapp && { whatsapp: data.whatsapp }),
    });

    const created = await http.get<Student>(`/students/${session.profile.id}`);
    return created;
  },

  update: async (id: string, data: Partial<Omit<Student, 'id' | 'createdAt'>>): Promise<Student> => {
    return http.patch<Student>(`/students/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return http.delete<void>(`/students/${id}`);
  }
};
