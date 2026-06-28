import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/common/database/prisma.service';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly REFRESH_TOKEN_TTL_DAYS = 30;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async generateTokens(payload: { userId: string; email: string; role: AdminRole }) {
    const expiresIn = this.configService.get('JWT_EXPIRY', '7d') as any;

    const access_token = this.jwtService.sign(
      { sub: payload.userId, email: payload.email, role: payload.role },
      { expiresIn },
    );

    const refresh_token = await this.createRefreshToken(payload.userId);

    return { access_token, refresh_token };
  }

  async refreshAccessToken(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { admin: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.prisma.refreshToken.delete({ where: { token } });
      }
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    if (stored.admin.deletedAt) {
      throw new UnauthorizedException('Ce compte a été désactivé');
    }

    // Rotation : supprimer l'ancien, émettre un nouveau
    await this.prisma.refreshToken.delete({ where: { token } });

    const expiresIn = this.configService.get('JWT_EXPIRY', '7d') as any;
    const access_token = this.jwtService.sign(
      { sub: stored.admin.id, email: stored.admin.email, role: stored.admin.role },
      { expiresIn },
    );
    const refresh_token = await this.createRefreshToken(stored.admin.id);

    return { access_token, refresh_token };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
  }

  async revokeAllRefreshTokens(adminId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { adminId } });
  }

  private async createRefreshToken(adminId: string): Promise<string> {
    const token = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_TTL_DAYS);

    await this.prisma.refreshToken.create({ data: { token, adminId, expiresAt } });
    return token;
  }
}
