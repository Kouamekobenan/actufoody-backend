import { Post } from '../entities/post.entity';
import { Prisma, Post as prismaPost } from '@prisma/client';
import { MediaType } from '../enums/media.enum';
import { CreatePostDto } from '../../application/dtos/create-post.dto';
import { UpdatePostDto } from '../../application/dtos/update-post.dto';

export class PostMapper {
  toEntity(model: prismaPost & { category?: any; tags?: any[]; _count?: any }): Post {
    return new Post(
      model.id,
      model.title,
      model.content,
      model.mediaType as MediaType,
      model.mediaUrl,
      model.categoryId,
      model.adminId,
      model.publishedAt,
      model.updatedAt,
      model.isPublished,
      (model as any).views ?? 0,
      model.category,
      model.tags?.map((pt: any) => pt.tag?.name ?? pt) ?? [],
      model._count?.likes ?? 0,
      model._count?.comments ?? 0,
      (model as any).sourceUrl ?? null,
    );
  }

  toApplication(dto: CreatePostDto): Prisma.PostCreateInput {
    const data: Prisma.PostCreateInput = {
      title: dto.title,
      content: dto.content,
      mediaType: dto.mediaType,
      mediaUrl: dto.mediaUrl,
      sourceUrl: dto.sourceUrl ?? null,
      admin: { connect: { id: dto.adminId } },
      isPublished: dto.isPublished,
    };
    if (dto.categoryId) {
      data.category = { connect: { id: dto.categoryId } };
    }
    return data;
  }

  toUpdate(update: UpdatePostDto): Prisma.PostUpdateInput {
    const result: Prisma.PostUpdateInput = {};
    if (update.title !== undefined) result.title = update.title;
    if (update.content !== undefined) result.content = update.content;
    if (update.categoryId !== undefined) result.category = { connect: { id: update.categoryId } };
    if (update.mediaType !== undefined) result.mediaType = update.mediaType;
    if (update.mediaUrl !== undefined) result.mediaUrl = update.mediaUrl;
    if (update.sourceUrl !== undefined) result.sourceUrl = update.sourceUrl ?? null;
    return result;
  }
}
