import { PaginatedResponseRepository } from 'src/common/generique/global.response';
import { CreatePostDto } from '../../application/dtos/create-post.dto';
import { Post } from '../entities/post.entity';
import { UpdatePostDto } from '../../application/dtos/update-post.dto';

export const PostRepositoryName = 'IPostRepository';
export interface IPostRepository {
  create(dto: CreatePostDto): Promise<Post>;
  findOne(id: string): Promise<Post>;
  delete(id: string): Promise<void>;
  findAll(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Post>>;
  update(id: string, updateDto: UpdatePostDto): Promise<Post>;
}
