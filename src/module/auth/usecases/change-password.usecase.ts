import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepositoryName } from '../users/application/interfaces/user.interface.repository';
import { AuthService } from '../services/auth.service';
import { ChangePasswordDto } from '../users/application/dtos/change-password.dto';
import { UserRepository } from '../users/infrastructure/repository/user.rpository';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(UserRepositoryName)
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.getUserById(userId);

    const isValid = await this.authService.comparePassword(
      dto.currentPassword,
      user.getPassword(),
    );
    if (!isValid) {
      throw new UnauthorizedException('Le mot de passe actuel est incorrect');
    }

    const hashed = await this.authService.hashPassword(dto.newPassword);
    await this.userRepository.updatePassword(userId, hashed);

    // Invalider toutes les sessions actives après changement de mot de passe
    await this.authService.revokeAllRefreshTokens(userId);
  }
}
