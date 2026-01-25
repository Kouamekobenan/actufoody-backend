import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../domain/interface/category.repository';
import { PrismaService } from 'src/common/database/prisma.service';
import { CategoryMapper } from '../domain/mappers/category.mapper';
import { CreateCategoryDto } from '../application/dtos/create-category.dto';
import { Category } from '../domain/entities/category';
import { UpdateCategoryDto } from '../application/dtos/update-category.dto';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: CategoryMapper,
  ) {}
  async create(dto: CreateCategoryDto): Promise<Category> {
    const newCategory = this.mapper.toApplication(dto);
    const categories = await this.prisma.category.create({
      data: newCategory,
    });
    return this.mapper.toEntity(categories);
  }
  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { posts: true },
    });
    if (!category) {
      throw new Error();
    }
    return this.mapper.toEntity(category);
  }
  async deleteOne(id: string): Promise<void> {
    const category = await this.prisma.category.delete({ where: { id } });
    if (!category) {
      throw new Error();
    }
  }
  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: { posts: true },
    });
    const allCategories = categories.map((cat) => this.mapper.toEntity(cat));
    return allCategories;
  }
  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const UpdateData = this.mapper.toUpdate(data);
    const categorieUpdate = await this.prisma.category.update({
      where: { id },
      data: UpdateData,
    });
    return this.mapper.toEntity(categorieUpdate);
  }
  async findCatTendance(): Promise<Category> {
    const cat = await this.prisma.category.findFirst({
      where: { name: 'Tendance' },
      orderBy: { createdAt: 'desc' },
      include: { posts: true },
    });
    if (!cat) {
      throw new Error('Category not found');
    }
    return this.mapper.toEntity(cat);
  }
  async findName(catName: string): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: { name: catName },
      include: { posts: true },
    });
    if (!category) {
      throw new Error('Category not found');
    }
    return this.mapper.toEntity(category);
  }
}
