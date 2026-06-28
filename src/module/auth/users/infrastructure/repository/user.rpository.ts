import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { type IUserRepository } from '../../application/interfaces/user.interface.repository';
import { UserMapper } from '../../domain/mappers/user.mapper';
import { UserDto } from '../../application/dtos/user.dto';
import { FilterUserDto } from '../../application/dtos/filter-user.dto';
import { UpdateProfileDto } from '../../application/dtos/update-profile.dto';
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
      const data = this.mapper.toPersitence(dataUser);
      const user = await this.prisma.admin.create({ data });
      return this.mapper.toAplication(user);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Un compte avec cet email existe déjà');
      }
      this.logger.error('Erreur création utilisateur', error?.stack);
      throw new BadGatewayException('Erreur lors de la création du compte');
    }
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const user = await this.prisma.admin.findUnique({
      where: { email, deletedAt: null },
    });
    if (!user) return null;
    return this.mapper.toAplication(user);
  }

  async getUserById(userId: string): Promise<Admin> {
    const user = await this.prisma.admin.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    return this.mapper.toAplication(user);
  }

  async getAllUsers(): Promise<Admin[]> {
    try {
      const users = await this.prisma.admin.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      return users.map((u) => this.mapper.toAplication(u));
    } catch (error: any) {
      throw new BadGatewayException("Erreur lors de la récupération des utilisateurs");
    }
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<Admin> {
    if (data.email) {
      const existing = await this.prisma.admin.findFirst({
        where: { email: data.email, NOT: { id: userId }, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException('Cet email est déjà utilisé par un autre compte');
      }
    }
    try {
      const updated = await this.prisma.admin.update({
        where: { id: userId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.email !== undefined && { email: data.email }),
        },
      });
      return this.mapper.toAplication(updated);
    } catch (error: any) {
      this.logger.error('Erreur mise à jour profil', error?.stack);
      throw new InternalServerErrorException('Impossible de mettre à jour le profil');
    }
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.prisma.admin.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.prisma.admin.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    await this.prisma.admin.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }

  async paginate(limit: number, page: number): Promise<{
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
          where: { deletedAt: null },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.admin.count({ where: { deletedAt: null } }),
      ]);
      return {
        data: users.map((u) => this.mapper.toAplication(u)),
        total,
        totalPage: Math.ceil(total / limit),
        page,
        limit,
      };
    } catch (error: any) {
      this.logger.error('Erreur pagination', error?.stack);
      throw new BadRequestException('Erreur lors de la pagination');
    }
  }

  async filter(filter: FilterUserDto, limit: number, page: number): Promise<{
    data: Admin[];
    total: number;
    totalPage: number;
    limit: number;
    page: number;
  }> {
    try {
      const where: any = { deletedAt: null };
      if (filter.email) where.email = filter.email;
      if (filter.name) where.name = { contains: filter.name, mode: 'insensitive' };

      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.prisma.admin.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        this.prisma.admin.count({ where }),
      ]);
      return {
        data: users.map((u) => this.mapper.toAplication(u)),
        total,
        totalPage: Math.ceil(total / limit),
        page,
        limit,
      };
    } catch (error: any) {
      this.logger.error('Erreur filtre utilisateurs', error?.stack);
      throw new BadRequestException('Erreur lors du filtrage');
    }
  }
}
