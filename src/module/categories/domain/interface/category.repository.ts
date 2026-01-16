import { CreateCategoryDto } from '../../application/dtos/create-category.dto';
import { UpdateCategoryDto } from '../../application/dtos/update-category.dto';
import { Category } from '../entities/category';

export const CategoryRepositoryName = 'ICategoryRepository';
export interface ICategoryRepository {
  create(dto: CreateCategoryDto): Promise<Category>;
  findOne(id: string): Promise<Category>;
  deleteOne(id: string): Promise<void>;
  findAll(): Promise<Category[]>;
  update(id: string, data:UpdateCategoryDto): Promise<Category>;
}
