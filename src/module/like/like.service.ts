import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma.service';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(postId: string, adminId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post introuvable');

    const existing = await this.prisma.like.findUnique({
      where: { postId_adminId: { postId, adminId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.like.create({ data: { postId, adminId } });
    }

    const count = await this.prisma.like.count({ where: { postId } });
    return { liked: !existing, likesCount: count };
  }

  async getLikesCount(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post introuvable');
    const count = await this.prisma.like.count({ where: { postId } });
    return { postId, likesCount: count };
  }
}
