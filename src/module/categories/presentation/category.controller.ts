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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { CategoryService } from '../application/usecase/category.service';
import { CreateCategoryDto } from '../application/dtos/create-category.dto';
import { Category } from '../domain/entities/category';
import { UpdateCategoryDto } from '../application/dtos/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle catégorie' })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Données nécessaires pour créer une catégorie',
  })
  @ApiResponse({
    status: 201,
    description: 'Catégorie créée avec succès',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur de validation ou de requête invalide',
  })
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    const category = await this.categoryService.create(dto);
    return category;
  }
  @Get(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Recuperer une categorie par son ID' })
  @ApiParam({ name: 'id', example: 'Addje1233nvdhsjenaedc' })
  async findOne(@Param('id') id: string): Promise<Category> {
    return await this.categoryService.findOne(id);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.CONTINUE)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', example: 'abcdefghjihk-234zerr' })
  async deleteOne(@Param('id') id: string) {
    return await this.categoryService.deleteOne(id);
  }
  @Get()
  @ApiOperation({ summary: 'Récuperez tous les catégories' })
  async findAll() {
    return await this.categoryService.findAll();
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Modifier la categorie par son ID' })
  @ApiParam({ name: 'id', example: 'airedrnftyyyyyyyyygfd' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.update(id, dto);
  }
  @Get('tendance/cat')
  @ApiOperation({ summary: 'Récuperez la catégorie tendance' })
  async findCatTendance() {
    return await this.categoryService.findCatTendance();
  }
  @Get('/tendance/by-name') // Changez 'catName' par 'by-name' pour éviter la confusion
  @ApiOperation({ summary: 'Récupérer la catégorie par son nom' })
  @ApiQuery({ name: 'name', required: true, type: String })
  async findName(@Query('name') name: string) {
    if (!name) {
      throw new BadRequestException('Le nom de la catégorie est requis');
    }
    // On nettoie la chaîne (trim) pour éviter les erreurs d'espaces invisibles
    return this.categoryService.findName(name.trim());
  }
}
