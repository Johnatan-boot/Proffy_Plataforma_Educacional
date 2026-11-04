type TeacherWithDetails = {
  id: string;
  userId: string;
  bio: string;
  hourlyRate: unknown;
  createdAt: Date;
  user: {
    name: string;
    email: string;
    avatar: string | null;
    whatsapp: string | null;
  };
  subjects: {
    subject: {
      id: string;
      name: string;
    };
  }[];
  availabilities?: {
    id: string;
    weekDay: number;
    from: string;
    to: string;
  }[];
};

export function toTeacherResponse(teacher: TeacherWithDetails) {
  const primarySubject = teacher.subjects[0]?.subject ?? null;

  return {
    id: teacher.id,
    userId: teacher.userId,
    name: teacher.user.name,
    email: teacher.user.email,
    avatar: teacher.user.avatar ?? "",
    whatsapp: teacher.user.whatsapp ?? "",
    bio: teacher.bio,
    cost: Number(teacher.hourlyRate),
    subjectId: primarySubject?.id ?? "",
    subject: primarySubject?.name ?? "",
    subjects: teacher.subjects.map((ts) => ({
      id: ts.subject.id,
      name: ts.subject.name,
    })),
    availabilities: (teacher.availabilities ?? []).map((a) => ({
      id: a.id,
      weekDay: a.weekDay,
      from: a.from,
      to: a.to,
    })),
    createdAt: teacher.createdAt,
  };
}
