import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {type IUserRepository } from '../../application/interfaces/user.interface.repository';
import { UserMapper } from '../../domain/mappers/user.mapper';
import { UserDto } from '../../application/dtos/user.dto';
import { FilterUserDto } from '../../application/dtos/filter-user.dto';
import { PrismaService } from 'src/common/database/prisma.service';
import { Admin } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: UserMapper,
  ) {}

  async createUser(dataUser: UserDto): Promise<Admin> {
    try {
      const createusers = this.mapper.toPersitence(dataUser);
      const users = await this.prisma.admin.create({ data: createusers });
      return this.mapper.toAplication(users);
    } catch (error) {
      const logger = new Logger('UserCreation');
      //
      logger.error('Une erreur est survenue', error.stack);
      // console.error
      throw new BadGatewayException('une erreur', error);
    }
  }
  async findByEmail(email: string): Promise<Admin | null> {
    const user = await this.prisma.admin.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'email ${email} non trouvé`,
      );
    }

    try {
      return this.mapper.toAplication(user);
    } catch (error) {
      console.error('Erreur lors du mapping du User :', error);
      throw new InternalServerErrorException('Erreur interne du serveur');
    }
  }

  async getAllUsers(): Promise<Admin[]> {
    try {
      const allUsers = await this.prisma.admin.findMany();
      return allUsers.map((user) => this.mapper.toAplication(user));
    } catch (error) {
      throw new BadGatewayException("une erreur s'est produite:", error);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const user = await this.prisma.admin.delete({ where: { id: userId } });
      if (!user) {
        throw new Error('user no exist!');
      }
    } catch (error) {
      console.error("une erreur s\'est produite lors de suppression!");
    }
  }
  async getUserById(userId: string): Promise<Admin> {
    try {
      const users = await this.prisma.admin.findUnique({
        where: { id: userId },
      });
      if (!users) {
        throw new NotFoundException(`User :${userId} doesn't exist!`);
      }
      return this.mapper.toAplication(users);
    } catch (error) {
      throw new BadRequestException(`User not found!: ${error.message}`);
    }
  }
  async paginate(
    limit: number,
    page: number,
  ): Promise<{
    data: Admin[];
    totalPage: number;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.prisma.admin.findMany({
          skip: skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.admin.count(),
      ]);
      const userMap = users.map((user) => this.mapper.toAplication(user));
      this.logger.log('Users data by pagination', JSON.stringify(userMap));
      return {
        data: userMap,
        total,
        totalPage: Math.ceil(total / limit),
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Failed to paginate users', error.stack);
      throw new BadRequestException('Failed to paginate users', {
        cause: error,
        description: error.message,
      });
    }
  }
  async filter(
    filter: FilterUserDto,
    limit: number,
    page: number,
  ): Promise<{
    data: Admin[];
    total: number;
    totalPage: number;
    limit: number;
    page: number;
  }> {
    try {
      const query: any = {};
      if (filter.email !== undefined) {
        query.email = filter.email;
      }
      if (filter.name !== undefined) {
        query.name = { contains: filter.name, mode: 'insensitive' };
      }
      if (filter.phone !== undefined) {
        query.phone = filter.phone;
      }
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.prisma.admin.findMany({
          where: query,
          skip: skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.admin.count({ where: query }),
      ]);
      const userMap = users.map((user) => this.mapper.toAplication(user));
      return {
        data: userMap,
        total,
        totalPage: Math.ceil(total / limit),
        page,
        limit,
      };
    } catch (error) {
      this.logger.error('Failed to filter users');
      throw new BadRequestException('Failed to filter user ', {
        cause: error,
        description: error.message,
      });
    }
  }

}
