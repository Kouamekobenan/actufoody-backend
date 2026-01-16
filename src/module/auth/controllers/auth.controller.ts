import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UnauthorizedException,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserUseCase } from '../usecases/register.user.use-case';
import { LoginUserUseCase } from '../usecases/login.use-case';
import { UserDto } from '../users/application/dtos/user.dto';
import { LoginDto } from '../users/application/dtos/login-dto.dto';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthMeUseCase } from '../usecases/authme.usecase';
import { Admin } from '../users/domain/entities/user.entity';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
@Controller('auth')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard) // ✅ Guards au niveau controller
export class AuthController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,

    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly authMeUseCase: AuthMeUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Récupérer le profil utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Informations utilisateur récupérées',
    type: Admin,
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async me(@Req() req: any) {
    // ✅ Vérification de sécurité
    if (!req.user.userId) {
      this.logger.error('req.user is undefined or missing userId');
      this.logger.error('req.user:', req.user);
      throw new UnauthorizedException(
        'Token invalide ou utilisateur non trouvé',
      );
    }
    return await this.authMeUseCase.execute(req.user.userId);
  }
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur est crée, retourne un token',
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiBody({ type: UserDto })
  async register(@Body() userData: UserDto) {
    return this.registerUseCase.execute(userData);
  }
  @Public()
  @Post('login')
  @ApiOperation({ summary: "Connexion d'un utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie, retourne un token',
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiBody({ type: LoginDto }) // Permet de documenter le body attendu
  async login(@Body() loginDto: LoginDto) {
    return await this.loginUserUseCase.execute(
      loginDto.email,
      loginDto.password,
    );
  }
}
