import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  CategoryRepositoryName,
  type ICategoryRepository,
} from '../../domain/interface/category.repository';
import { Category } from '../../domain/entities/category';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(CategoryRepositoryName)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    this.logger.log(`Creating category: ${dto.name}`, 'CategoryService');

    try {
      const category = await this.categoryRepository.create(dto);

      this.logger.log(
        `Category created successfully: ${category.id}`,
        'CategoryService',
      );

      return category;
    } catch (error) {
      this.logger.error(
        `Failed to create category: ${dto.name}`,
        error.stack,
        'CategoryService',
      );

      // Différencier les types d'erreurs
      if (error.code === '23505' || error.message?.includes('unique')) {
        throw new ConflictException(
          `Category with name "${dto.name}" already exists`,
        );
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create category', {
        cause: error,
      });
    }
  }

  async findOne(id: string): Promise<Category> {
    this.logger.log(`Fetching category with id: ${id}`, 'CategoryService');

    try {
      const category = await this.categoryRepository.findOne(id);

      if (!category) {
        throw new NotFoundException(`Category with id "${id}" not found`);
      }

      return category;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve category: ${id}`,
        error.stack,
        'CategoryService',
      );

      // Re-throw les exceptions HTTP de NestJS
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to retrieve category', {
        cause: error,
      });
    }
  }

  async deleteOne(id: string): Promise<boolean> {
    this.logger.log(`Deleting category with id: ${id}`, 'CategoryService');

    try {
      // Vérifier d'abord si la catégorie existe
      const category = await this.categoryRepository.findOne(id);

      if (!category) {
        throw new NotFoundException(`Category with id "${id}" not found`);
      }

      await this.categoryRepository.deleteOne(id);

      this.logger.log(
        `Category deleted successfully: ${id}`,
        'CategoryService',
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete category: ${id}`,
        error.stack,
        'CategoryService',
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      // Erreur de contrainte (catégorie utilisée ailleurs)
      if (error.code === '23503') {
        throw new ConflictException(
          'Cannot delete category as it is being used',
        );
      }

      throw new InternalServerErrorException('Failed to delete category', {
        cause: error,
      });
    }
  }

  async findAll(): Promise<Category[]> {
    this.logger.log('Fetching all categories', 'CategoryService');

    try {
      return await this.categoryRepository.findAll();
    } catch (error) {
      this.logger.error(
        'Failed to retrieve categories',
        error.stack,
        'CategoryService',
      );

      throw new InternalServerErrorException('Failed to retrieve categories', {
        cause: error,
      });
    }
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    this.logger.log(`Updating category: ${id}`, 'CategoryService');

    try {
      const category = await this.categoryRepository.update(id, data);

      if (!category) {
        throw new NotFoundException(`Category with id "${id}" not found`);
      }

      this.logger.log(
        `Category updated successfully: ${id}`,
        'CategoryService',
      );

      return category;
    } catch (error) {
      this.logger.error(
        `Failed to update category: ${id}`,
        error.stack,
        'CategoryService',
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === '23505' || error.message?.includes('unique')) {
        throw new ConflictException(
          `Category with name "${data.name}" already exists`,
        );
      }

      throw new InternalServerErrorException('Failed to update category', {
        cause: error,
      });
    }
  }

  async findCatTendance(): Promise<Category> {
    this.logger.log('Fetching trending category', 'CategoryService');

    try {
      const category = await this.categoryRepository.findCatTendance();

      if (!category) {
        throw new NotFoundException('No trending category found');
      }

      return category;
    } catch (error) {
      this.logger.error(
        'Failed to retrieve trending category',
        error.stack,
        'CategoryService',
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve trending category',
        { cause: error },
      );
    }
  }

  async findName(catName: string): Promise<Category> {
    this.logger.log(`Fetching category by name: ${catName}`, 'CategoryService');

    try {
      const category = await this.categoryRepository.findName(catName);

      if (!category) {
        throw new NotFoundException(
          `Category with name "${catName}" not found`,
        );
      }

      return category;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve category by name: ${catName}`,
        error.stack,
        'CategoryService',
      );

      // ✅ Ne pas écraser les NotFoundException
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve category by name',
        { cause: error },
      );
    }
  }
}
