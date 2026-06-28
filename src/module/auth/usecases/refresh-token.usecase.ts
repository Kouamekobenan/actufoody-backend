import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute(refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }
}
