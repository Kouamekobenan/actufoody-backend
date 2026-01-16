import { Injectable, Module } from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma.service';
import { CategoryRepositoryName } from './domain/interface/category.repository';
import { CategoryRepository } from './infrastructure/category.repository';
import { CategoryMapper } from './domain/mappers/category.mapper';
import { CategoryService } from './application/usecase/category.service';
import { CategoryController } from './presentation/category.controller';

@Module({
  imports: [],

  controllers: [CategoryController],
  providers: [
    // serviec
    PrismaService,
    // use cases
    CategoryService,

    {
      provide: CategoryRepositoryName,
      useClass: CategoryRepository,
    },

    //   mappers
    CategoryMapper,
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
