import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  type IPostRepository,
  PostRepositoryName,
} from '../../domain/interface/post.repository';
import { Post } from '../../domain/entities/post.entity';
import { PaginatedResponseRepository } from 'src/common/generique/global.response';

@Injectable()
export class FindAllPostService {
  private readonly logger = new Logger(FindAllPostService.name);
  constructor(
    @Inject(PostRepositoryName)
    private readonly postRepo: IPostRepository,
  ) {}
  async execute(
    limit: number,
    page: number,
  ): Promise<PaginatedResponseRepository<Post>> {
    try {
      const posts = await this.postRepo.findAll(limit, page);
      return posts;
    } catch (error) {
      this.logger.error('Failled to retrieve posts', error.stack);
      throw new Error();
    }
  }
}
