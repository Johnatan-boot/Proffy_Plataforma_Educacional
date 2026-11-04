const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  email: 'E-mail',
  password: 'Senha',
  bio: 'Sobre você',
  hourlyRate: 'Valor da hora/aula',
  whatsapp: 'WhatsApp',
  avatar: 'Avatar (URL)',
  subjectId: 'Matéria',
  role: 'Perfil',
};

// Traduz as mensagens padrão do Zod para algo que o usuário entende.
function translateValidationMessage(message: string): string {
  const min = message.match(/>=\s*(\d+)\s*characters/);
  if (min) return `precisa ter no mínimo ${min[1]} caracteres`;
  const max = message.match(/<=\s*(\d+)\s*characters/);
  if (max) return `precisa ter no máximo ${max[1]} caracteres`;
  if (/invalid email/i.test(message)) return 'e-mail inválido';
  if (/invalid url/i.test(message)) return 'precisa ser uma URL válida';
  if (/expected number/i.test(message)) return 'precisa ser um número';
  if (/>0|greater than 0/i.test(message)) return 'precisa ser maior que zero';
  return message;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.clone().json();
    const fieldErrors = data?.errors?.fieldErrors as Record<string, string[]> | undefined;

    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      return Object.entries(fieldErrors)
        .map(([field, messages]) =>
          `${FIELD_LABELS[field] || field}: ${translateValidationMessage(messages[0])}`
        )
        .join(' · ');
    }

    const known: Record<string, string> = {
      'Teacher already has a schedule in this time range': 'O professor já tem uma aula nesse horário.',
      'Student already has a schedule in this time range': 'O aluno já tem uma aula nesse horário.',
      'Teacher not found': 'Professor não encontrado.',
      'Student not found': 'Aluno não encontrado.',
      'Subject not found': 'Disciplina não encontrada.',
      'Schedule not found': 'Aula não encontrada.',
    };

    return known[data?.message] || data?.message || `Erro ${response.status}`;
  } catch {
    const text = await response.text();
    return text || `Erro ${response.status}`;
  }
}

export const http = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
    if (response.status === 204) return undefined as T;
    return response.json();
  },
  
  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
    if (response.status === 204) return undefined as T;
    return response.json();
  },

  async patch<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
    if (response.status === 204) return undefined as T;
    return response.json();
  },
  
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
    if (response.status === 204) return undefined as T;
    return response.json();
  }
};
