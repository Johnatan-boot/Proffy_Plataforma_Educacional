import { ConflictError, NotFoundError } from "../../shared/errors/app-error";
import { SubjectRepository } from "../subject/subject.repository";
import { TeacherRepository } from "../teachers/teacher.repository";
import { TeacherSubjectRepository } from "./teacher-subject.repository";

export class TeacherSubjectService {
  constructor(
    private readonly teacherSubjectRepository: TeacherSubjectRepository,
    private readonly teacherRepository: TeacherRepository,
    private readonly subjectRepository: SubjectRepository,
  ) {}

  async create(data: {
    teacherId: string;
    subjectId: string;
  }) {
    const teacher = await this.teacherRepository.findById(data.teacherId);

    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }

    const subject = await this.subjectRepository.findById(data.subjectId);

    if (!subject) {
      throw new NotFoundError("Subject not found");
    }

    const existingTeacherSubject =
      await this.teacherSubjectRepository.findByTeacherAndSubject(
        data.teacherId,
        data.subjectId,
      );

    if (existingTeacherSubject) {
      throw new ConflictError("Teacher already has this subject");
    }

    return this.teacherSubjectRepository.create(data);
  }

  async findById(id: string) {
    return this.teacherSubjectRepository.findById(id);
  }

  async delete(id: string) {
    const teacherSubject =
      await this.teacherSubjectRepository.findById(id);

    if (!teacherSubject) {
      throw new NotFoundError("TeacherSubject not found");
    }

    return this.teacherSubjectRepository.delete(id);
  }
}
