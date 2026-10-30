import { ConflictError } from "../../shared/errors/app-error";
import { UserRepository } from "./user.repository";
import { CreateUserInput, UpdateUserInput } from "./user.schema";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(input: CreateUserInput) {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    return this.userRepository.create(input);
  }

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, input: UpdateUserInput) {
    if (input.email) {
      const existingUser = await this.userRepository.findByEmail(input.email);

      if (existingUser && existingUser.id !== id) {
        throw new ConflictError("User with this email already exists");
      }
    }

    return this.userRepository.update(id, input);
  }

  async delete(id: string) {
    return this.userRepository.delete(id);
  }
}
