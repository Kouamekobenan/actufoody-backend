import { BadRequestException, Injectable } from '@nestjs/common';
import { IPostRepository } from '../domain/interface/post.repository';
import { PrismaService } from 'src/common/database/prisma.service';
import { PostMapper } from '../domain/mappers/post.mapper';
import { CreatePostDto } from '../application/dtos/create-post.dto';
import { Post } from '../domain/entities/post.entity';
import { PaginatedResponseRepository } from 'src/common/generique/global.response';
import { UpdatePostDto } from '../application/dtos/update-post.dto';

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: PostMapper,
  ) {}
  async create(dto: CreatePostDto): Promise<Post> {
    const post = this.mapper.toApplication(dto);
    const newPost = await this.prisma.post.create({ data: post });
    return this.mapper.toEntity(newPost);
  }
  async findOne(id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!post) {
      throw new BadRequestException('Error ID to post');
    }
    return this.mapper.toEntity(post);
  }
  async delete(id: string): Promise<void> {
     await this.prisma.post.delete({ where: { id } });
  }
  async findAll(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Post>> {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip: skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: { category: true },
      }),
      this.prisma.post.count(),
    ]);
    const allPosts = posts.map((prod) => this.mapper.toEntity(prod));
    return {
      data: allPosts,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }
  async update(id: string, updateDto: UpdatePostDto): Promise<Post> {
    const dto = this.mapper.toUpdate(updateDto);
    const updatePost = await this.prisma.post.update({
      where: { id },
      data: dto,
    });
    return this.mapper.toEntity(updatePost);
  }
}
