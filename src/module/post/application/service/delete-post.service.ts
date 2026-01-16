import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {type IPostRepository, PostRepositoryName } from '../../domain/interface/post.repository';
import {type FileUploader, FileUploaderName } from 'src/common/cloudinary/file-upload.interface';

@Injectable()
export class DeletePostUseCase {
  private readonly logger = new Logger(DeletePostUseCase.name);
  constructor(
    @Inject(PostRepositoryName)
    private readonly postRepo: IPostRepository,
    @Inject(FileUploaderName)
    private readonly fileUploader: FileUploader,
  ) {}
  async execute(id: string): Promise<boolean> {
    try {
      const post = await this.postRepo.findOne(id);
      if (!post) {
        throw new NotFoundException(`Restaurant not found ${id}`);
      }
      if (post.getMediaUrl()) {
        // Extraire le public_id depuis l’URL si nécessaire
        const publicId = this.extractPublicId(post.getMediaUrl() ?? '');
        if (publicId) {
          await this.fileUploader.delete(publicId, 'image');
        }
      }
      await this.postRepo.delete(id);
      return true;
    } catch (error) {
      this.logger.error('Failed to delete restaurant', error.stack);
      throw new BadRequestException('Failed to delete restaurant', {
        cause: error,
        description: error.message,
      });
    }
  }
  private extractPublicId(image: string): string | null {
    try {
      const parts = image.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0]; // sans extension
      return publicId ? `folder_name/${publicId}` : null; // optionnel : ajouter le dossier
    } catch {
      return null;
    }
  }
}
