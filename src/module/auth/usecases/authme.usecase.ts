import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {type IUserRepository, UserRepositoryName } from '../users/application/interfaces/user.interface.repository';
import { Admin } from '../users/domain/entities/user.entity';

@Injectable()
export class AuthMeUseCase {
  private readonly logger = new Logger(AuthMeUseCase.name);
  constructor(
    @Inject(UserRepositoryName)
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(userId: string):Promise<Admin> {
    try {
      const user = await this.userRepository.getUserById(userId);
      return user;
    } catch (error) {
      throw new BadRequestException('Failed to retrieve user', {
        cause: error,
        description: error.message,
      });
    }
  }
}
