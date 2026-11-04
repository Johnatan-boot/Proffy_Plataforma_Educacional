import { ConflictError, AppError } from "../../shared/errors/app-error";
import { hashPassword, verifyPassword } from "../../shared/crypto/password";
import { UserRepository } from "../users/user.repository";
import { TeacherRepository } from "../teachers/teacher.repository";
import { StudentRepository } from "../students/student.repository";
import { TeacherSubjectRepository } from "../teacher-subject/teacher-subject.repository";
import { toUserResponse } from "../users/user.mapper";
import { RegisterInput, LoginInput } from "./auth.schema";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly teacherRepository: TeacherRepository,
    private readonly studentRepository: StudentRepository,
    private readonly teacherSubjectRepository: TeacherSubjectRepository,
  ) {}

  async register(input: RegisterInput) {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash: hashPassword(input.password),
      role: input.role,
      avatar: input.avatar,
      whatsapp: input.whatsapp,
    });

    if (input.role === "TEACHER") {
      const teacher = await this.teacherRepository.create({
        userId: user.id,
        bio: input.bio!,
        hourlyRate: input.hourlyRate!,
      });

      if (input.subjectId) {
        await this.teacherSubjectRepository.create({
          teacherId: teacher.id,
          subjectId: input.subjectId,
        });
      }

      return { user: toUserResponse(user), profile: teacher };
    }

    if (input.role === "STUDENT") {
      const student = await this.studentRepository.create({ userId: user.id });
      return { user: toUserResponse(user), profile: student };
    }

    return { user: toUserResponse(user), profile: null };
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      throw new AppError("Invalid email or password", 401);
    }

    let profile: unknown = null;

    if (user.role === "TEACHER") {
      profile = await this.teacherRepository.findByUserId(user.id);
    } else if (user.role === "STUDENT") {
      profile = await this.studentRepository.findByUserId(user.id);
    }

    return { user: toUserResponse(user), profile };
  }
}
