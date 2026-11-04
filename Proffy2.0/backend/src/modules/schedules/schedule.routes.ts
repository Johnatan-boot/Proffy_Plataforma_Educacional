import { FastifyInstance } from "fastify";
import { ScheduleController } from "./schedule.controller";
import { ScheduleService } from "./schedule.service";
import { ScheduleRepository } from "./schedule.repository";
import { TeacherRepository } from "../teachers/teacher.repository";
import { StudentRepository } from "../students/student.repository";
import { SubjectRepository } from "../subject/subject.repository";

export async function scheduleRoutes(app: FastifyInstance) {
  const scheduleRepository = new ScheduleRepository();
  const teacherRepository = new TeacherRepository();
  const studentRepository = new StudentRepository();
  const subjectRepository = new SubjectRepository();

  const scheduleService = new ScheduleService(
    scheduleRepository,
    teacherRepository,
    studentRepository,
    subjectRepository,
  );

  const scheduleController = new ScheduleController(
    scheduleService,
  );

  app.get(
    "/api/v1/schedules",
    scheduleController.listAll.bind(scheduleController),
  );

  app.post(
    "/api/v1/schedules",
    scheduleController.create.bind(scheduleController),
  );

  app.get(
    "/api/v1/schedules/teacher/:teacherId",
    scheduleController.listByTeacher.bind(scheduleController),
  );

  app.get(
    "/api/v1/schedules/student/:studentId",
    scheduleController.listByStudent.bind(scheduleController),
  );

  app.get(
    "/api/v1/schedules/:id",
    scheduleController.findById.bind(scheduleController),
  );

  app.patch(
    "/api/v1/schedules/:id",
    scheduleController.update.bind(scheduleController),
  );

  app.delete(
    "/api/v1/schedules/:id",
    scheduleController.delete.bind(scheduleController),
  );
}