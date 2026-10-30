import { ConflictError, NotFoundError } from "../../shared/errors/app-error";
import { SubjectRepository } from "./subject.repository";

export class SubjectService {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async create(data: { name: string }) {
    const existingSubject = await this.subjectRepository.findByName(data.name);

    if (existingSubject) {
      throw new ConflictError("Subject already exists");
    }

    return this.subjectRepository.create(data);
  }

  async findAll() {
    return this.subjectRepository.findAll();
  }

  async findById(id: string) {
    return this.subjectRepository.findById(id);
  }

  async findByName(name: string) {
    return this.subjectRepository.findByName(name);
  }

  async delete(id: string) {
    const subject = await this.subjectRepository.findById(id);

    if (!subject) {
      throw new NotFoundError("Subject not found");
    }

    return this.subjectRepository.delete(id);
  }

  async update(id: string, data: { name: string }) {
    const subject = await this.subjectRepository.findById(id);

    if (!subject) {
      throw new NotFoundError("Subject not found");
    }

    const existingWithName = await this.subjectRepository.findByName(
      data.name,
    );

    if (existingWithName && existingWithName.id !== id) {
      throw new ConflictError("Subject already exists");
    }

    return this.subjectRepository.update(id, data);
  }
}