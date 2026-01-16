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

@Injectable()
export class FindOnePostUseCase {
  private readonly logger = new Logger(FindOnePostUseCase.name);
  constructor(
    @Inject(PostRepositoryName)
    private readonly postRepository: IPostRepository,
  ) {}
  async execute(id: string): Promise<Post> {
    try {
      const post = await this.postRepository.findOne(id);
      return post;
    } catch (error) {
      this.logger.error('Failled to retrieve post', error.stack);
      throw new BadRequestException('Failled to retrieve post ', error);
    }
  }
}
