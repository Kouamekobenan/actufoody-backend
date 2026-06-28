import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategie';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthController } from './controllers/auth.controller';

import { UserRepository } from './users/infrastructure/repository/user.rpository';
import { UserMapper } from './users/domain/mappers/user.mapper';
import { UserRepositoryName } from './users/application/interfaces/user.interface.repository';

import { RegisterUserUseCase } from './usecases/register.user.use-case';
import { LoginUserUseCase } from './usecases/login.use-case';
import { AuthMeUseCase } from './usecases/authme.usecase';
import { RefreshTokenUseCase } from './usecases/refresh-token.usecase';
import { LogoutUseCase } from './usecases/logout.usecase';
import { UpdateProfileUseCase } from './usecases/update-profile.usecase';
import { ChangePasswordUseCase } from './usecases/change-password.usecase';

import { PrismaService } from 'src/common/database/prisma.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRY', '7d') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    UserMapper,
    // Use cases
    RegisterUserUseCase,
    LoginUserUseCase,
    AuthMeUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    // Repository
    { provide: UserRepositoryName, useClass: UserRepository },
  ],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
