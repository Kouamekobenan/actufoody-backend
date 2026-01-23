import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
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
    this.logger.log(`Creating category: ${dto.name}`, 'Category');
    try {
      const categories = await this.categoryRepository.create(dto);
      this.logger.log(
        `category created successfully: ${categories.id}`,
        'CategoryService',
      );

      return categories;
    } catch (error) {
      this.logger.error(
        `Failed to create category: ${CreateCategoryDto.name}`,
        error.stack,
        'CategoryName',
      );

      throw error;
    }
  }
  async findOne(id: string): Promise<Category> {
    this.logger.log({
      level: 'info',
      message: `Category id ${id}`,
    });

    try {
      const category = await this.categoryRepository.findOne(id);
      return category;
    } catch (error) {
      this.logger.error(`Failled to retrieve category :${id}:${error}`);
      throw new Error();
    }
  }
  async deleteOne(id: string): Promise<boolean> {
    this.logger.log({
      level: 'info',
      message: `Category delete id ${id}`,
    });
    try {
      await this.categoryRepository.deleteOne(id);
      return true;
    } catch (error) {
      this.logger.error('Error to delete category');
      throw new Error();
    }
  }
  async findAll(): Promise<Category[]> {
    try {
      return await this.categoryRepository.findAll();
    } catch (error) {
      this.logger.log('Failled to retrieve categoires');
      throw new BadRequestException('Failled to retrieve categories', error);
    }
  }
  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    try {
      const categories = await this.categoryRepository.update(id, data);
      return categories;
    } catch (error) {
      this.logger.error('Failled to updated categorie');
      throw new BadRequestException('Failled to updated categorie', error);
    }
  }
  async findCatTendance(): Promise<Category> {
    try {
      return await this.categoryRepository.findCatTendance();
    } catch (error) {
      this.logger.log('Failled to retrieve categoires');
      throw new BadRequestException('Failled to retrieve categories', error);
    }
  }
}
