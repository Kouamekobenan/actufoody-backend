import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { PrismaService } from 'src/common/database/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(postId: string, adminId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post introuvable');

    const comment = await this.prisma.comment.create({
      data: { content: dto.content, postId, adminId },
      include: { admin: { select: { id: true, name: true, email: true } } },
    });
    return comment;
  }

  async findByPost(postId: string, page = 1, limit = 20) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post introuvable');

    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.comment.count({ where: { postId } }),
    ]);

    return {
      data: comments,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  async delete(commentId: string, requesterId: string, requesterRole: AdminRole) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Commentaire introuvable');

    const isOwner = comment.adminId === requesterId;
    const isSuperAdmin = requesterRole === AdminRole.SUPER_ADMIN;

    if (!isOwner && !isSuperAdmin) {
      throw new ForbiddenException("Vous ne pouvez supprimer que vos propres commentaires");
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Commentaire supprimé' };
  }
}
