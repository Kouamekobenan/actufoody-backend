import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import{ UserRepositoryName, type IUserRepository } from '../interfaces/user.interface.repository';
import { FilterUserDto } from '../dtos/filter-user.dto';
import { Admin } from '../../domain/entities/user.entity';

@Injectable()
export class FilterUserUseCase {
  constructor(
    @Inject(UserRepositoryName)
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(
    filter: FilterUserDto,
    limit: number,
    page: number,
  ): Promise<{ data: Admin[]; limit: number; page: number }> {
    try {
      const FilterUserDto = await this.userRepository.filter(
        filter,
        limit,
        page,
      );
      return {
        data: FilterUserDto.data,
        limit: FilterUserDto.limit,
        page: FilterUserDto.page,
      };
    } catch (error) {
      throw new BadRequestException('Failed to filter users', {
        cause: error,
        description: error.message,
      });
    }
  }
}
