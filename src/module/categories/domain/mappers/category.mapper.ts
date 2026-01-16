import { Prisma } from '@prisma/client/extension';
import { CreateCategoryDto } from '../../application/dtos/create-category.dto';
import { UpdateCategoryDto } from '../../application/dtos/update-category.dto';
import { Category } from '../entities/category';
import { Category as PrismaModel } from '@prisma/client';
export class CategoryMapper {
  toEntity(model: PrismaModel & { posts?: any[] }): Category {
    return new Category(
      model.id,
      model.name,
      model.description,
      model.posts,
      model.createdAt,
      model.updatedAt,
    );
  }
  toApplication(dto: CreateCategoryDto): any {
    return {
      name: dto.name,
      description: dto.description,
    };
  }
  toUpdate(update: UpdateCategoryDto): any {
    return {
      name: update.name,
      description: update.description,
    };
  }
}
