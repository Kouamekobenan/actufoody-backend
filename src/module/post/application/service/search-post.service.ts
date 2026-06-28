import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type IPostRepository, PostRepositoryName } from '../../domain/interface/post.repository';

@Injectable()
export class SearchPostService {
  constructor(
    @Inject(PostRepositoryName)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(query: string, limit: number, page: number) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('La recherche doit contenir au moins 2 caractères');
    }
    return this.postRepository.search(query.trim(), limit, page);
  }
}
