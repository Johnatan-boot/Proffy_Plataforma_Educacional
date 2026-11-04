import { ConflictError, NotFoundError } from "../../shared/errors/app-error";
import { UserRepository } from "../users/user.repository";
import { TeacherRepository } from "./teacher.repository";
import { TeacherSubjectRepository } from "../teacher-subject/teacher-subject.repository";

export class TeacherService {
  constructor(
    private readonly teacherRepository: TeacherRepository,
    private readonly userRepository: UserRepository,
    private readonly teacherSubjectRepository?: TeacherSubjectRepository,
  ) {}

  async create(data: {
    userId: string;
    bio: string;
    hourlyRate: number;
  }) {
    const user = await this.userRepository.findById(data.userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const existingTeacher = await this.teacherRepository.findByUserId(
      data.userId,
    );

    if (existingTeacher) {
      throw new ConflictError("User already has a teacher profile");
    }

    return this.teacherRepository.create(data);
  }

  async findById(id: string) {
    return this.teacherRepository.findById(id);
  }

  async findByIdWithDetails(id: string) {
    return this.teacherRepository.findByIdWithDetails(id);
  }

  async findAllWithDetails() {
    return this.teacherRepository.findAllWithDetails();
  }

  async findByUserId(userId: string) {
    return this.teacherRepository.findByUserId(userId);
  }

  async update(
    id: string,
    data: {
      bio?: string;
      hourlyRate?: number;
      name?: string;
      avatar?: string;
      whatsapp?: string;
      subjectId?: string;
    },
  ) {
    const teacher = await this.teacherRepository.findById(id);

    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }

    const { name, avatar, whatsapp, subjectId, ...teacherFields } = data;

    if (name || avatar || whatsapp) {
      await this.userRepository.update(teacher.userId, {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(whatsapp && { whatsapp }),
      });
    }

    if (subjectId && this.teacherSubjectRepository) {
      const existing = await this.teacherSubjectRepository
        .findByTeacherAndSubject(id, subjectId)
        .catch(() => null);

      if (!existing) {
        await this.teacherSubjectRepository.create({
          teacherId: id,
          subjectId,
        });
      }

      await this.teacherSubjectRepository.deleteAllExcept(id, subjectId);
    }

    if (Object.keys(teacherFields).length > 0) {
      return this.teacherRepository.update(id, teacherFields);
    }

    return teacher;
  }

  async delete(id: string) {
    const teacher = await this.teacherRepository.findById(id);

    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }

    return this.teacherRepository.delete(id);
  }
}