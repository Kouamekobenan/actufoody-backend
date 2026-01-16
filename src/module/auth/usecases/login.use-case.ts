import { Injectable, Inject } from '@nestjs/common';
import {type IUserRepository, UserRepositoryName } from '../users/application/interfaces/user.interface.repository';
import { AuthService } from '../services/auth.service';
import { Admin } from '../users/domain/entities/user.entity';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(UserRepositoryName)
    private readonly userRepository: IUserRepository,
    private readonly authservice: AuthService,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<{ user: Admin; token: {} }> {
    const isUser = await this.userRepository.findByEmail(email);
    if (!isUser) {
      throw new Error(`ce email:${email} est incorrect`);
    }

    const isComparePassword = await this.authservice.comparePassword(
      password,
      isUser.getPassword(),
    );
    if (!isComparePassword) {
      throw new Error(`ce password:${password} est incorrect`);
    }

    const generateToken = await this.authservice.generateToken({
      userId: isUser.getId(),
      email: isUser.getEmail(),
    });

    return { user: isUser, token: generateToken };
  }
}
