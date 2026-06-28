import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Param,
  Get,
  Delete,
  Patch,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AdminRole } from '@prisma/client';
import { CategoryService } from '../application/usecase/category.service';
import { CreateCategoryDto } from '../application/dtos/create-category.dto';
import { Category } from '../domain/entities/category';
import { UpdateCategoryDto } from '../application/dtos/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth('auth-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.EDITOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle catégorie (auth requis)' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Catégorie créée avec succès', type: Category })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return await this.categoryService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les catégories' })
  async findAll() {
    return await this.categoryService.findAll();
  }

  @Public()
  @Get('tendance/cat')
  @ApiOperation({ summary: 'Récupérer la catégorie tendance' })
  async findCatTendance() {
    return await this.categoryService.findCatTendance();
  }

  @Public()
  @Get('tendance/by-name')
  @ApiOperation({ summary: 'Récupérer une catégorie par son nom' })
  @ApiQuery({ name: 'name', required: true, type: String })
  async findName(@Query('name') name: string) {
    if (!name) {
      throw new BadRequestException('Le nom de la catégorie est requis');
    }
    return this.categoryService.findName(name.trim());
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Récupérer une catégorie par son ID' })
  @ApiParam({ name: 'id', example: 'clx123abc' })
  async findOne(@Param('id') id: string): Promise<Category> {
    return await this.categoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.EDITOR)
  @ApiOperation({ summary: 'Modifier une catégorie (auth requis)' })
  @ApiParam({ name: 'id', example: 'clx123abc' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<Category> {
    return await this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une catégorie (SUPER_ADMIN uniquement)' })
  @ApiParam({ name: 'id', example: 'clx123abc' })
  async deleteOne(@Param('id') id: string) {
    return await this.categoryService.deleteOne(id);
  }
}
