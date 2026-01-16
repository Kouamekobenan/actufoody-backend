import { Admin } from '../../domain/entities/user.entity';
import { FilterUserDto } from '../dtos/filter-user.dto';
import { UserDto } from '../dtos/user.dto';

export const UserRepositoryName = 'IUserRepository';
export interface IUserRepository {
  createUser(dataUser: UserDto): Promise<Admin>;
  findByEmail(email: string): Promise<Admin | null>;
  getAllUsers(): Promise<Admin[]>;
  deleteUser(userId: string): Promise<void>;
  getUserById(userId: string): Promise<Admin>;
  paginate(
    limit: number,
    page: number,
  ): Promise<{
    data: Admin[];
    totalPage: number;
    total: number;
    page: number;
    limit: number;
  }>;
  filter(
    filter: FilterUserDto,
    limit: number,
    page: number,
  ): Promise<{
    data: Admin[];
    total: number;
    totalPage: number;
    limit: number;
    page: number;
  }>;
 
}
