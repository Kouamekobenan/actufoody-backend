import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/curent-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RegisterUserUseCase } from '../usecases/register.user.use-case';
import { LoginUserUseCase } from '../usecases/login.use-case';
import { AuthMeUseCase } from '../usecases/authme.usecase';
import { RefreshTokenUseCase } from '../usecases/refresh-token.usecase';
import { LogoutUseCase } from '../usecases/logout.usecase';
import { UpdateProfileUseCase } from '../usecases/update-profile.usecase';
import { ChangePasswordUseCase } from '../usecases/change-password.usecase';
import { UserDto } from '../users/application/dtos/user.dto';
import { LoginDto } from '../users/application/dtos/login-dto.dto';
import { RefreshTokenDto } from '../users/application/dtos/refresh-token.dto';
import { UpdateProfileDto } from '../users/application/dtos/update-profile.dto';
import { ChangePasswordDto } from '../users/application/dtos/change-password.dto';

@ApiTags('Auth')
@ApiBearerAuth('auth-token')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly authMeUseCase: AuthMeUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  // ─── Routes publiques ──────────────────────────────────────────────────────

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un nouveau compte' })
  @ApiBody({ type: UserDto })
  @ApiResponse({ status: 201, description: 'Compte créé — retourne access_token + refresh_token' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async register(@Body() userData: UserDto) {
    return this.registerUseCase.execute(userData);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se connecter' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie — retourne access_token + refresh_token' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto) {
    return this.loginUserUseCase.execute(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renouveler le access token via le refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Nouveaux tokens générés' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto.refreshToken);
  }

  // ─── Routes protégées (JWT requis) ────────────────────────────────────────

  @Get('me')
  @ApiOperation({ summary: 'Récupérer son profil' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async me(@CurrentUser() user: { userId: string }) {
    if (!user?.userId) {
      throw new UnauthorizedException('Token invalide');
    }
    return this.authMeUseCase.execute(user.userId);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mettre à jour son profil (nom, email)' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profil mis à jour' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async updateMe(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute(user.userId, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Changer son mot de passe' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Mot de passe changé — toutes les sessions révoquées' })
  @ApiResponse({ status: 401, description: 'Mot de passe actuel incorrect' })
  async changePassword(
    @CurrentUser() user: { userId: string },
    @Body() dto: ChangePasswordDto,
  ) {
    await this.changePasswordUseCase.execute(user.userId, dto);
    return { message: 'Mot de passe modifié avec succès. Veuillez vous reconnecter.' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se déconnecter (révoque le refresh token)' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.logoutUseCase.execute(dto.refreshToken);
    return { message: 'Déconnexion réussie' };
  }
}
