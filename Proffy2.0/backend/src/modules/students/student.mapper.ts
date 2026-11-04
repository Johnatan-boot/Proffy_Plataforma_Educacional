type StudentWithDetails = {
  id: string;
  userId: string;
  createdAt: Date;
  user: {
    name: string;
    email: string;
    avatar: string | null;
    whatsapp: string | null;
  };
};

export function toStudentResponse(student: StudentWithDetails) {
  return {
    id: student.id,
    userId: student.userId,
    name: student.user.name,
    email: student.user.email,
    avatar: student.user.avatar ?? "",
    whatsapp: student.user.whatsapp ?? "",
    createdAt: student.createdAt,
  };
}
