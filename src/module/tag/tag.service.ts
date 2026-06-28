import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma.service';
import { SetTagsDto } from './dto/set-tags.dto';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
  }

  async setPostTags(postId: string, dto: SetTagsDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post introuvable');

    // Upsert tous les tags demandés
    const tagOps = dto.tags.map((name) =>
      this.prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      }),
    );
    const tags = await Promise.all(tagOps);

    // Remplacer tous les PostTag du post
    await this.prisma.$transaction([
      this.prisma.postTag.deleteMany({ where: { postId } }),
      this.prisma.postTag.createMany({
        data: tags.map((tag) => ({ postId, tagId: tag.id })),
      }),
    ]);

    return { postId, tags: tags.map((t) => t.name) };
  }

  async getPostsByTag(tagName: string, page = 1, limit = 10) {
    const tag = await this.prisma.tag.findUnique({
      where: { name: tagName.toLowerCase() },
    });
    if (!tag) throw new NotFoundException(`Tag "${tagName}" introuvable`);

    const skip = (page - 1) * limit;
    const [postTags, total] = await Promise.all([
      this.prisma.postTag.findMany({
        where: { tagId: tag.id },
        skip,
        take: limit,
        include: {
          post: {
            include: { category: true, tags: { include: { tag: true } }, _count: { select: { likes: true, comments: true } } },
          },
        },
        orderBy: { post: { publishedAt: 'desc' } },
      }),
      this.prisma.postTag.count({ where: { tagId: tag.id } }),
    ]);

    return {
      data: postTags.map((pt) => this.formatPost(pt.post)),
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  private formatPost(post: any) {
    return {
      ...post,
      tags: post.tags?.map((pt: any) => pt.tag.name) ?? [],
      likesCount: post._count?.likes ?? 0,
      commentsCount: post._count?.comments ?? 0,
      _count: undefined,
    };
  }
}
