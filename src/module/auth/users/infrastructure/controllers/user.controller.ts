import {
  Controller,
  Delete,
  Get,
  Param,
  Request,
  UseGuards,
  NotFoundException,
  Query,
  UsePipes,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FindAllUserUseCase } from '../../application/usecases/findAlluser.user.use-case';
import { DeleteUserUseCase } from '../../application/usecases/delete.user.use-case';
import { Public } from 'src/common/decorators/public.decorator';
import { FindUserByIdUseCase } from '../../application/usecases/find_user_by_id.use_case';
import { PaginateDto } from '../../application/dtos/paginate-user.dto';
import { PaginateUserUseCase } from '../../application/usecases/paginate-user.usecase';
import { FilterUserUseCase } from '../../application/usecases/filter-user.usecase';
import { FilterUserDto } from '../../application/dtos/filter-user.dto';
import { Admin } from '../../domain/entities/user.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly findAllUserUseCase: FindAllUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly paginateUserUseCase: PaginateUserUseCase,
    private readonly filterUserUseCase: FilterUserUseCase,
  
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiOkResponse({
    description: 'Liste des utilisateurs récupérée avec succès',
    type: [Admin],
  })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  async getAllUsers(): Promise<Admin[]> {
    return await this.findAllUserUseCase.execute();
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateurs' })
  async deleteUser(@Param('id') userId: string): Promise<boolean> {
    try {
      this.deleteUserUseCase.execute(userId);
      return true;
    } catch {
      console.error;
      return false;
    }
  }
  @Get('filter')
  @ApiOperation({ summary: 'Filtrer les utilisateurs' })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: "Adresse email de l'utilisateur",
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: "Nom de l'utilisateur",
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    type: String,
    description: "Numéro de téléphone de l'utilisateur",
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numéro de page pour la pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: "Nombre d'éléments par page",
    example: 10,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async filter(
    @Query() filters: FilterUserDto,
    @Query() paginate: PaginateDto,
  ) {
    return await this.filterUserUseCase.execute(
      filters,
      paginate.limit,
      paginate.page,
    );
  }
  @Get('paginate')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Paginer les livraisons' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numéro de la page (par défaut: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: "Nombre d'éléments par page (par défaut: 2)",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des livraisons',
    schema: {
      example: {
        data: [
          {
            id: 1,
            supplierId: 'uuid',
            createdAt: '2025-06-11T12:00:00.000Z',
            updatedAt: '2025-06-11T12:00:00.000Z',
          },
        ],
        total: 12,
        totalPage: 6,
        page: 1,
        limit: 2,
      },
    },
  })
  async paginate(@Query() query: PaginateDto) {
    return await this.paginateUserUseCase.execute(query.limit, query.page);
  }
  @Public()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer le user par son ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur récupéré avec succès',
    type: Admin,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async getUserById(@Param('id') userId: string): Promise<Admin> {
    console.log('User ID:', userId);
    const user = await this.findUserByIdUseCase.execute(userId);
    return user;
  }
}
