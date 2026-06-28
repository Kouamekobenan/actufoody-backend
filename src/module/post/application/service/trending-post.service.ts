import { Inject, Injectable } from '@nestjs/common';
import { type IPostRepository, PostRepositoryName } from '../../domain/interface/post.repository';

@Injectable()
export class TrendingPostService {
  constructor(
    @Inject(PostRepositoryName)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(limit = 10) {
    return this.postRepository.findTrending(limit);
  }
}
