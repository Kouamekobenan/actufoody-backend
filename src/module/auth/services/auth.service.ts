import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  private readonly RoundSalt = 10;
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.RoundSalt);
  }
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  async generateToken(payload: {
    userId: string;
    email: string;
  }) {
    return {
      access_token: this.jwtService.sign(
        {
          sub: payload.userId, 
          email: payload.email,
        },
        { expiresIn: '1h' },
      ),
    };
  }
}
