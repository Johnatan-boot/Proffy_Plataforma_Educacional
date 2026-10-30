import { prisma } from "../../lib/prisma";

export class TeacherSubjectRepository {
  async create(data: {
    teacherId: string;
    subjectId: string;
  }) {
    return prisma.teacherSubject.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.teacherSubject.findUnique({
      where: {
        id,
      },
    });
  }

  async findByTeacherAndSubject(
    teacherId: string,
    subjectId: string,
  ) {
    return prisma.teacherSubject.findUnique({
      where: {
        teacherId_subjectId: {
          teacherId,
          subjectId,
        },
      },
    });
  }

  // Mantém apenas a matéria informada: trocar a matéria de um professor
  // deve SUBSTITUIR a anterior (antes ela era apenas acrescentada e a lista
  // continuava exibindo a matéria antiga).
  async deleteAllExcept(teacherId: string, keepSubjectId: string) {
    return prisma.teacherSubject.deleteMany({
      where: {
        teacherId,
        subjectId: { not: keepSubjectId },
      },
    });
  }

  async delete(id: string) {
    return prisma.teacherSubject.delete({
      where: {
        id,
      },
    });
  }
}
