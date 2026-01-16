import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthController } from './controllers/auth.controller';
import { UserRepository } from './users/infrastructure/repository/user.rpository';
import { UserMapper } from './users/domain/mappers/user.mapper';
import { JwtStrategy } from './strategies/jwt.strategie';
import { RegisterUserUseCase } from './usecases/register.user.use-case';
import { LoginUserUseCase } from './usecases/login.use-case';
import { PassportModule } from '@nestjs/passport';
import { AuthMeUseCase } from './usecases/authme.usecase';
import { PrismaService } from 'src/common/database/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // services
    AuthService,
    // use cases
    RegisterUserUseCase,
    LoginUserUseCase,
    AuthMeUseCase,
    // injection dependance
    PrismaService, // ✅ Ajout de PrismaService

    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },

    // mapper
    UserMapper,

    // guards
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
