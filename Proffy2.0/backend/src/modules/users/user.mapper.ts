import { User } from "../../generated/prisma/client";

export function toUserResponse(user: User) {
  const { passwordHash, ...safeUser } = user;

  return safeUser;
}
