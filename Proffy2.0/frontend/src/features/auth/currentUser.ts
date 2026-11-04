import { getSession } from "./session";

export interface CurrentUser {
  name: string;
  role: string;
  avatar: string;
}

const ROLE_LABELS: Record<string, string> = {
  TEACHER: "Professor(a)",
  STUDENT: "Aluno(a)",
  ADMIN: "Diretoria",
};

// Deriva o usuário atual da sessão real (login/register).
// Se ninguém autenticou ainda nesta aba, cai em um convidado genérico
// para as telas administrativas continuarem navegáveis durante o desenvolvimento.
function resolveCurrentUser(): CurrentUser {
  const session = getSession();

  if (!session) {
    return {
      name: "Visitante",
      role: "Não autenticado",
      avatar: "https://i.pravatar.cc/150?img=68",
    };
  }

  return {
    name: session.user.name,
    role: ROLE_LABELS[session.user.role] || session.user.role,
    avatar: session.user.avatar || "https://i.pravatar.cc/150?img=68",
  };
}

export function getCurrentUser(): CurrentUser {
  return resolveCurrentUser();
}
