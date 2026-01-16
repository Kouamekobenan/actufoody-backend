import { Injectable, Module } from '@nestjs/common';
import { UserController } from './infrastructure/controllers/user.controller';
import { UserRepository } from './infrastructure/repository/user.rpository';
import { UserMapper } from './domain/mappers/user.mapper';
import { FindAllUserUseCase } from './application/usecases/findAlluser.user.use-case';
import { DeleteUserUseCase } from './application/usecases/delete.user.use-case';
import { FindUserByIdUseCase } from './application/usecases/find_user_by_id.use_case';
import { PaginateUserUseCase } from './application/usecases/paginate-user.usecase';
import { FilterUserUseCase } from './application/usecases/filter-user.usecase';
import { PrismaService } from 'src/common/database/prisma.service';
import { UserRepositoryName } from './application/interfaces/user.interface.repository';


@Module({
  imports: [],

  controllers: [UserController],
  providers: [
    // serviec
    PrismaService,
    // use cases
    FindAllUserUseCase,
    DeleteUserUseCase,
    FindUserByIdUseCase,
    PaginateUserUseCase,
    FilterUserUseCase,
    {
      provide: UserRepositoryName,
      useClass: UserRepository,
    },

    //   mappers
    UserMapper,
  ],
  exports: [],
})
export class UserModule {}
