import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { type IUserRepository, UserRepositoryName } from '../users/application/interfaces/user.interface.repository';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(UserRepositoryName)
    private readonly userRepository: IUserRepository,
    private readonly authservice: AuthService,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isValid = await this.authservice.comparePassword(password, user.getPassword());
    if (!isValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const tokens = await this.authservice.generateTokens({
      userId: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
    });

    return { user, ...tokens };
  }
}
