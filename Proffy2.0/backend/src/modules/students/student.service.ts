import {
  ConflictError,
  NotFoundError,
} from "../../shared/errors/app-error";
import { UserRepository } from "../users/user.repository";
import { StudentRepository } from "./student.repository";

export class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(data: {
    userId: string;
  }) {
    const user = await this.userRepository.findById(data.userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const existingStudent = await this.studentRepository.findByUserId(
      data.userId,
    );

    if (existingStudent) {
      throw new ConflictError("User already has a student profile");
    }

    return this.studentRepository.create(data);
  }

  async findById(id: string) {
    return this.studentRepository.findById(id);
  }

  async findByIdWithDetails(id: string) {
    return this.studentRepository.findByIdWithDetails(id);
  }

  async findAllWithDetails() {
    return this.studentRepository.findAllWithDetails();
  }

  async findByUserId(userId: string) {
    return this.studentRepository.findByUserId(userId);
  }

  async update(
    id: string,
    data: { name?: string; email?: string; avatar?: string; whatsapp?: string },
  ) {
    const student = await this.studentRepository.findById(id);

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);

      if (existingUser && existingUser.id !== student.userId) {
        throw new ConflictError("User with this email already exists");
      }
    }

    if (Object.keys(data).length > 0) {
      await this.userRepository.update(student.userId, data);
    }

    return this.studentRepository.findByIdWithDetails(id);
  }

  async delete(id: string) {
    const student = await this.studentRepository.findById(id);

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    return this.studentRepository.delete(id);
  }
}