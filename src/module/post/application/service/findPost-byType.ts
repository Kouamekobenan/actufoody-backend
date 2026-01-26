import { Inject, Injectable } from '@nestjs/common';
import {
  PostRepositoryName,
  type IPostRepository,
} from '../../domain/interface/post.repository';
import { MediaType } from '../../domain/enums/media.enum';

@Injectable()
export class FindPostByTypeService {
  constructor(
    @Inject(PostRepositoryName)
    private readonly postRepository: IPostRepository,
  ) {}
  async execute(type: MediaType, limit: number, page: number) {
    try {
      return this.postRepository.findPostsByType(type, limit, page);
    } catch (error) {
      throw error;
    }
  }
}
