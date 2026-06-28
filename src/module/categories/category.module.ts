import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma.service';
import { CategoryRepositoryName } from './domain/interface/category.repository';
import { CategoryRepository } from './infrastructure/category.repository';
import { CategoryMapper } from './domain/mappers/category.mapper';
import { CategoryService } from './application/usecase/category.service';
import { CategoryController } from './presentation/category.controller';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [
    PrismaService,
    CategoryService,
    RolesGuard,
    { provide: CategoryRepositoryName, useClass: CategoryRepository },
    CategoryMapper,
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
