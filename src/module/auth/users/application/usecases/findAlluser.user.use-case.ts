import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '../interfaces/user.interface.repository';
import { UserRepositoryName } from '../interfaces/user.interface.repository';
import type { Admin } from '../../domain/entities/user.entity';

@Injectable()
export class FindAllUserUseCase {
  constructor(
    @Inject(UserRepositoryName)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<Admin[]> {
    try {
      return await this.userRepository.getAllUsers();
    } catch (error) {
      console.error('Unable to get all users:', error);
      throw new Error('Failed to get all users');
    }
  }
}
