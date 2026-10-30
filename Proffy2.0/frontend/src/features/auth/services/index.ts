import { http } from "@/services/http";
import { AuthSession, LoginPayload, RegisterPayload } from "../types";
import { setSession, clearSession, getSession } from "../session";

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthSession> => {
    const session = await http.post<AuthSession>("/auth/register", payload);
    setSession(session);
    return session;
  },

  login: async (payload: LoginPayload): Promise<AuthSession> => {
    const session = await http.post<AuthSession>("/auth/login", payload);
    setSession(session);
    return session;
  },

  logout: () => {
    clearSession();
  },

  getCurrentSession: getSession,
};
