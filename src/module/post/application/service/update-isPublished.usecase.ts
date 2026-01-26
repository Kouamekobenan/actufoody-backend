import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  type IPostRepository,
  PostRepositoryName,
} from '../../domain/interface/post.repository';

@Injectable()
export class UpdateIsPublishedUseCase {
  private readonly logger = new Logger(UpdateIsPublishedUseCase.name);
  constructor(
    @Inject(PostRepositoryName)
    private readonly postRepository: IPostRepository,
  ) {}
  async execute(postId: string, isPublished: boolean) {
    try {
      const updatedPost = await this.postRepository.updateIsPublished(
        postId,
        isPublished,
      );
      this.logger.log(`Post ${postId} updated isPublished to ${isPublished}`);
      return updatedPost;
    } catch (error) {
      this.logger.error(
        `Failed to update isPublished for Post ${postId}: ${error.message}`,
      );
      throw error;
    }
  }
}
