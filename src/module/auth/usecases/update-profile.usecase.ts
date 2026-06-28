import { Inject, Injectable } from '@nestjs/common';
import { UserRepositoryName } from '../users/application/interfaces/user.interface.repository';
import { UpdateProfileDto } from '../users/application/dtos/update-profile.dto';
import { Admin } from '../users/domain/entities/user.entity';
import { UserRepository } from '../users/infrastructure/repository/user.rpository';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(UserRepositoryName)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<Admin> {
    return this.userRepository.updateProfile(userId, dto);
  }
}
