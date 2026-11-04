import { Prisma } from "../../generated/prisma/client";
import { TeacherRepository } from "../../modules/teachers/teacher.repository";
import { StudentRepository } from "../../modules/students/student.repository";
import { ScheduleRepository } from "../../modules/schedules/schedule.repository";

export function createTeacherRepository(
  overrides: Partial<TeacherRepository> = {},
): TeacherRepository {
  return {
    create: async () => {
      throw new Error("Not implemented");
    },

    findById: async () => ({
      id: "teacher-1",
      userId: "user-1",
      bio: "Professor de teste",
      hourlyRate: new Prisma.Decimal(50),
      createdAt: new Date(),
    }),

    findByUserId: async () => null,

    findAllWithDetails: async () => [],

    findByIdWithDetails: async () => null,

    update: async () => {
      throw new Error("Not implemented");
    },

    delete: async () => {
      throw new Error("Not implemented");
    },

    ...overrides,
  } as TeacherRepository;
}

export function createStudentRepository(
  overrides: Partial<StudentRepository> = {},
): StudentRepository {
  return {
    create: async () => {
      throw new Error("Not implemented");
    },

    findById: async () => ({
      id: "student-1",
      userId: "user-2",
      createdAt: new Date(),
    }),

    findByUserId: async () => null,

    findAllWithDetails: async () => [],

    findByIdWithDetails: async () => null,

    delete: async () => {
      throw new Error("Not implemented");
    },

    ...overrides,
  } as StudentRepository;
}

export function createScheduleRepository(
  overrides: Partial<ScheduleRepository> = {},
): ScheduleRepository {
  return {
    create: async () => {
      throw new Error("Not implemented");
    },

    findById: async () => null,

    findByTeacherId: async () => [],

    findByStudentId: async () => [],

    findAllWithDetails: async () => [],

    findAllWithDetailsById: async () => null,

    update: async () => {
      throw new Error("Not implemented");
    },

    delete: async () => {
      throw new Error("Not implemented");
    },

    ...overrides,
  } as ScheduleRepository;
}
