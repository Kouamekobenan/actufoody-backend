import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(refreshToken: string): Promise<void> {
    await this.authService.revokeRefreshToken(refreshToken);
  }
}
