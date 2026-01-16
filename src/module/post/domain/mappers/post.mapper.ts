import { Post } from '../entities/post.entity';
import { Prisma, Post as prismaPost } from '@prisma/client';
import { MediaType } from '../enums/media.enum';
import { CreatePostDto } from '../../application/dtos/create-post.dto';
import { UpdatePostDto } from '../../application/dtos/update-post.dto';
export class PostMapper {
  toEntity(model: prismaPost & { category?: any }): Post {
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
      model.category,
    );
  }
  toApplication(dto: CreatePostDto): Prisma.PostCreateInput {
    return {
      title: dto.title,
      content: dto.content,
      mediaType: dto.mediaType,
      mediaUrl: dto.mediaUrl,
      category: { connect: { id: dto.categoryId } },
      admin: { connect: { id: dto.adminId } },
      isPublished: dto.isPublished,
    };
  }
  toUpdate(update: UpdatePostDto): Prisma.PostUpdateInput {
    const resultUpdat: Prisma.PostUpdateInput = {};
    if (update.title !== undefined) {
      resultUpdat.title = update.title;
    }
    if (update.content !== undefined) {
      resultUpdat.content = update.content;
    }
    if (update.categoryId !== undefined) {
      resultUpdat.category = { connect: { id: update.categoryId } };
    }
    if (update.mediaType !== undefined) {
      resultUpdat.mediaType = update.mediaType;
    }
    if (update.mediaUrl !== undefined) {
      resultUpdat.mediaUrl = update.mediaUrl;
    }
    return resultUpdat;
  }
}
