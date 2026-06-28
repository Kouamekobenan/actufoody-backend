import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../domain/interface/post.repository';
import { PrismaService } from 'src/common/database/prisma.service';
import { PostMapper } from '../domain/mappers/post.mapper';
import { CreatePostDto } from '../application/dtos/create-post.dto';
import { Post } from '../domain/entities/post.entity';
import { PaginatedResponseRepository } from 'src/common/generique/global.response';
import { UpdatePostDto } from '../application/dtos/update-post.dto';
import { MediaType } from '../domain/enums/media.enum';

const POST_INCLUDE = {
  category: true,
  tags: { include: { tag: true } },
  _count: { select: { likes: true, comments: true } },
};

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: PostMapper,
  ) {}

  async create(dto: CreatePostDto): Promise<Post> {
    const data = this.mapper.toApplication(dto);
    const post = await this.prisma.post.create({ data, include: POST_INCLUDE });
    return this.mapper.toEntity(post);
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({ where: { id }, include: POST_INCLUDE });
    if (!post) throw new NotFoundException('Post introuvable');

    // Incrémenter les vues en arrière-plan (fire-and-forget)
    this.prisma.post.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

    return this.mapper.toEntity(post);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.post.delete({ where: { id } });
  }

  async findAll(limit: number, page: number): Promise<PaginatedResponseRepository<Post>> {
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { isPublished: true },
        skip,
        take: safeLimit,
        orderBy: { publishedAt: 'desc' },
        include: POST_INCLUDE,
      }),
      this.prisma.post.count({ where: { isPublished: true } }),
    ]);

    return {
      data: posts.map((p) => this.mapper.toEntity(p)),
      total,
      totalPages: Math.ceil(total / safeLimit),
      page: safePage,
      limit: safeLimit,
    };
  }

  async update(id: string, updateDto: UpdatePostDto): Promise<Post> {
    const data = this.mapper.toUpdate(updateDto);
    const post = await this.prisma.post.update({ where: { id }, data, include: POST_INCLUDE });
    return this.mapper.toEntity(post);
  }

  async findPostsByType(type: MediaType, limit: number, page: number): Promise<PaginatedResponseRepository<Post>> {
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;

    const where = { mediaType: type, isPublished: true };
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({ skip, take: safeLimit, where, orderBy: { publishedAt: 'desc' }, include: POST_INCLUDE }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts.map((p) => this.mapper.toEntity(p)),
      total,
      totalPages: Math.ceil(total / safeLimit),
      page: safePage,
      limit: safeLimit,
    };
  }

  async updateIsPublished(postId: string, isPublished: boolean): Promise<Post> {
    const post = await this.prisma.post.update({
      where: { id: postId },
      data: { isPublished },
      include: POST_INCLUDE,
    });
    return this.mapper.toEntity(post);
  }

  async search(query: string, limit: number, page: number): Promise<PaginatedResponseRepository<Post>> {
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;

    const where = {
      isPublished: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { content: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({ where, skip, take: safeLimit, orderBy: { publishedAt: 'desc' }, include: POST_INCLUDE }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts.map((p) => this.mapper.toEntity(p)),
      total,
      totalPages: Math.ceil(total / safeLimit),
      page: safePage,
      limit: safeLimit,
    };
  }

  async findTrending(limit = 10): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: { isPublished: true },
      orderBy: [{ views: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
      include: POST_INCLUDE,
    });
    return posts.map((p) => this.mapper.toEntity(p));
  }
}
