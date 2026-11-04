import { Prisma, type Teacher } from "../generated/prisma/client";
import test from "node:test";
import assert from "node:assert/strict";

import { ScheduleService } from "../modules/schedules/schedule.service";
import { AppError, NotFoundError } from "../shared/errors/app-error";
import { ScheduleRepository } from "../modules/schedules/schedule.repository";
import { TeacherRepository } from "../modules/teachers/teacher.repository";
import { StudentRepository } from "../modules/students/student.repository";
import {
  createTeacherRepository,
  createStudentRepository,
  createScheduleRepository,
} from "./helpers/schedule-test-factories";

test("deve rejeitar agendamento com duração menor ou igual a zero", async () => {
  // Arrange
  const scheduleRepository = {} as any;
  const teacherRepository = {} as any;
  const studentRepository = {} as any;

  const service = new ScheduleService(
    scheduleRepository,
    teacherRepository,
    studentRepository,
  );

  // Act
  const promise = service.create({
    teacherId: "teacher-1",
    studentId: "student-1",
    subjectId: "subject-1",
    scheduledAt: new Date("2026-09-22T10:00:00"),
    duration: 0,
  });

  // Assert
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.message, "Invalid schedule duration");
    assert.equal(error.statusCode, 400);

    return true;
  });
});

test("deve rejeitar agendamento quando o professor não existe", async () => {
  // Arrange
 const scheduleRepository = createScheduleRepository();

  const teacherRepository = createTeacherRepository({
    findById: async () => null,
  });

  const studentRepository = createStudentRepository();

  const service = new ScheduleService(
    scheduleRepository,
    teacherRepository,
    studentRepository,
  );

  // Act
  const promise = service.create({
    teacherId: "teacher-1",
    studentId: "student-1",
    subjectId: "subject-1",
    scheduledAt: new Date("2026-09-22T10:00:00"),
    duration: 60,
  });

  // Assert
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof NotFoundError);
    assert.equal(error.message, "Teacher not found");
    assert.equal(error.statusCode, 404);

    return true;
  });
});

test("deve rejeitar agendamento quando o aluno não existe", async () => {
  // Arrange
  const scheduleRepository = createScheduleRepository();

  const teacherRepository = createTeacherRepository();

  const studentRepository = createStudentRepository({
    findById: async () => null,
  });

  const service = new ScheduleService(
    scheduleRepository,
    teacherRepository,
    studentRepository,
  );

  // Act
  const promise = service.create({
    teacherId: "teacher-1",
    studentId: "student-1",
    subjectId: "subject-1",
    scheduledAt: new Date("2026-09-22T10:00:00"),
    duration: 60,
  });

  // Assert
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof NotFoundError);
    assert.equal(error.message, "Student not found");
    assert.equal(error.statusCode, 404);

    return true;
  });
});

test("deve rejeitar agendamento quando houver conflito de horário", async () => {
  // Arrange
  const scheduleRepository: ScheduleRepository = {
    create: async () => {
      throw new Error("Not implemented");
    },

    findById: async () => null,

    findByTeacherId: async () => [
      {
        id: "schedule-1",
        teacherId: "teacher-1",
        studentId: "student-1",
        scheduledAt: new Date("2026-09-22T10:00:00"),
        subjectId: "subject-1",
        room: null,
        className: null,
        duration: 60,
        status: "PENDING",
        createdAt: new Date(),
      },
    ],

    findByStudentId: async () => [],

    findAllWithDetails: async () => [],

    findAllWithDetailsById: async () => null,

    update: async () => {
      throw new Error("Not implemented");
    },

    delete: async () => {
      throw new Error("Not implemented");
    },
  };

  const teacherRepository = createTeacherRepository();

  const studentRepository: StudentRepository = {
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
  };

  const service = new ScheduleService(
    scheduleRepository,
    teacherRepository,
    studentRepository,
  );

  // Act
  const promise = service.create({
    teacherId: "teacher-1",
    studentId: "student-1",
    subjectId: "subject-1",
    scheduledAt: new Date("2026-09-22T10:30:00"),
    duration: 60,
  });

  // Assert
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(
      error.message,
      "Teacher already has a schedule in this time range",
    );
    assert.equal(error.statusCode, 409);

    return true;
  });
});

test("deve permitir agendamento em horário imediatamente após outro", async () => {
  // Arrange
  const scheduleRepository = createScheduleRepository({
    create: async () => ({
      id: "schedule-2",
      teacherId: "teacher-1",
      studentId: "student-1",
      scheduledAt: new Date("2026-09-22T11:00:00"),
      subjectId: "subject-1",
        room: null,
        className: null,
        duration: 60,
      status: "PENDING",
      createdAt: new Date(),
    }),

    findByTeacherId: async () => [
      {
        id: "schedule-1",
        teacherId: "teacher-1",
        studentId: "student-2",
        scheduledAt: new Date("2026-09-22T10:00:00"),
        subjectId: "subject-1",
        room: null,
        className: null,
        duration: 60,
        status: "PENDING",
        createdAt: new Date(),
      },
    ],
  });

  const service = new ScheduleService(
    scheduleRepository,
    createTeacherRepository(),
    createStudentRepository(),
  );

  const schedule = await service.create({
    teacherId: "teacher-1",
    studentId: "student-1",
    subjectId: "subject-1",
    scheduledAt: new Date("2026-09-22T11:00:00"),
    duration: 60,
  });

  assert.equal(schedule.id, "schedule-2");
});

test("deve permitir agendamento quando o agendamento existente está cancelado", async () => {
  // Arrange
  const scheduleRepository: ScheduleRepository = {
    create: async () => ({
      id: "schedule-2",
      teacherId: "teacher-1",
      studentId: "student-1",
      scheduledAt: new Date("2026-09-22T10:00:00"),
      subjectId: "subject-1",
        room: null,
        className: null,
        duration: 60,
      status: "PENDING",
      createdAt: new Date(),
    }),

    findById: async () => null,

    findByTeacherId: async () => [
      {
        id: "schedule-1",
        teacherId: "teacher-1",
        studentId: "student-1",
        scheduledAt: new Date("2026-09-22T10:00:00"),
        subjectId: "subject-1",
        room: null,
        className: null,
        duration: 60,
        status: "CANCELLED",
        createdAt: new Date(),
      },
    ],

    findByStudentId: async () => [],

    findAllWithDetails: async () => [],

    findAllWithDetailsById: async () => null,

    update: async () => {
      throw new Error("Not implemented");
    },

    delete: async () => {
      throw new Error("Not implemented");
    },
  };

  const teacherRepository: TeacherRepository = {
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
  };

  const studentRepository: StudentRepository = {
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
  };

  const service = new ScheduleService(
    scheduleRepository,
    teacherRepository,
    studentRepository,
  );

  // Act
  const schedule = await service.create({
    teacherId: "teacher-1",
    studentId: "student-1",
    subjectId: "subject-1",
    scheduledAt: new Date("2026-09-22T10:00:00"),
    duration: 60,
  });

  // Assert
  assert.equal(schedule.teacherId, "teacher-1");
  assert.equal(schedule.studentId, "student-1");
  assert.equal(schedule.duration, 60);
});

test("deve rejeitar agendamento quando o aluno já tem aula no mesmo horário", async () => {
  const scheduleRepository = createScheduleRepository({
    findByStudentId: async () => [
      {
        id: "schedule-9",
        teacherId: "teacher-2",
        studentId: "student-1",
        scheduledAt: new Date("2026-09-22T10:00:00"),
        subjectId: "subject-1",
        room: null,
        className: null,
        duration: 60,
        status: "CONFIRMED",
        createdAt: new Date(),
      },
    ],
  });

  const service = new ScheduleService(
    scheduleRepository,
    createTeacherRepository(),
    createStudentRepository(),
  );

  await assert.rejects(
    service.create({
      teacherId: "teacher-1",
      studentId: "student-1",
      subjectId: "subject-1",
      scheduledAt: new Date("2026-09-22T10:30:00"),
      duration: 60,
    }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.message, "Student already has a schedule in this time range");
      assert.equal(error.statusCode, 409);
      return true;
    },
  );
});

test("update: deve retornar 404 quando o agendamento não existe", async () => {
  const service = new ScheduleService(
    createScheduleRepository({ findById: async () => null }),
    createTeacherRepository(),
    createStudentRepository(),
  );

  await assert.rejects(
    service.update("nao-existe", { status: "CONFIRMED" }),
    (error: unknown) => {
      assert.ok(error instanceof NotFoundError);
      assert.equal(error.statusCode, 404);
      return true;
    },
  );
});

test("update: cancelar não revalida conflito e persiste o novo status", async () => {
  let updatedWith: unknown = null;
  const existing = {
    id: "schedule-1",
    teacherId: "teacher-1",
    studentId: "student-1",
    scheduledAt: new Date("2026-09-22T10:00:00"),
    subjectId: "subject-1",
    room: null,
    className: null,
    duration: 60,
    status: "CONFIRMED" as const,
    createdAt: new Date(),
  };

  const service = new ScheduleService(
    createScheduleRepository({
      findById: async () => existing,
      findByTeacherId: async () => [existing],
      update: async (_id: string, data: unknown) => {
        updatedWith = data;
        return existing as any;
      },
    }),
    createTeacherRepository(),
    createStudentRepository(),
  );

  await service.update("schedule-1", { status: "CANCELLED" });
  assert.deepEqual(updatedWith, { status: "CANCELLED" });
});

test("update: remarcar para horário ocupado pelo próprio professor deve falhar (ignorando a própria aula)", async () => {
  const mine = {
    id: "schedule-1",
    teacherId: "teacher-1",
    studentId: "student-1",
    scheduledAt: new Date("2026-09-22T10:00:00"),
    subjectId: "subject-1",
    room: null,
    className: null,
    duration: 60,
    status: "CONFIRMED" as const,
    createdAt: new Date(),
  };
  const other = { ...mine, id: "schedule-2", studentId: "student-2", scheduledAt: new Date("2026-09-22T14:00:00") };

  const service = new ScheduleService(
    createScheduleRepository({
      findById: async () => mine,
      findByTeacherId: async () => [mine, other],
    }),
    createTeacherRepository(),
    createStudentRepository(),
  );

  await assert.rejects(
    service.update("schedule-1", { scheduledAt: new Date("2026-09-22T14:30:00") }),
    (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 409);
      return true;
    },
  );
});
