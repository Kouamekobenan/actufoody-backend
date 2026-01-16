import { MediaType } from '../../domain/enums/media.enum';
// ==========================================
// 2. UseCase - UpdatePostUseCase
// ==========================================
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  type IPostRepository,
  PostRepositoryName,
} from '../../domain/interface/post.repository';
import { Post } from '../../domain/entities/post.entity';
import {
  FileUploaderName,
  type FileUploader,
} from 'src/common/cloudinary/file-upload.interface';
import { UpdatePostDto } from '../dtos/update-post.dto';

@Injectable()
export class UpdatePostUseCase {
  private readonly logger = new Logger(UpdatePostUseCase.name);

  constructor(
    @Inject(PostRepositoryName)
    private readonly postRepository: IPostRepository,

    @Inject(FileUploaderName)
    private readonly fileUploader: FileUploader,
  ) {}

  async execute(
    postId: string,
    updateDto: UpdatePostDto,
    file?: Express.Multer.File,
  ): Promise<Post> {
    let uploadedFileUrl: string | undefined;
    let uploadedFileId: string | undefined;
    let oldMediaUrl: string | null = null;

    try {
      // 1. Vérifier que le post existe
      const existingPost = await this.postRepository.findOne(postId);
      if (!existingPost) {
        throw new NotFoundException(`Post avec l'ID ${postId} introuvable`);
      }

      this.logger.log(
        `Updating post - ID: ${postId}, Title: "${existingPost.getTitle()}"`,
      );

      // Sauvegarder l'ancienne URL du média pour suppression ultérieure
      oldMediaUrl = existingPost.getMediaUrl();

      // 2. Upload du nouveau média si fichier présent
      if (file && updateDto.mediaType) {
        this.validateMediaTypeWithFile(updateDto.mediaType, file);

        const uploadResult = await this.uploadMedia(file, updateDto.mediaType);
        uploadedFileUrl = uploadResult.url;
        uploadedFileId = uploadResult.fileId;
        updateDto.mediaUrl = uploadedFileUrl;

        this.logger.log(
          `New media uploaded - URL: ${uploadedFileUrl}, FileId: ${uploadedFileId}`,
        );
      }

      // 3. Si mediaType change vers NONE, supprimer l'ancien média
      if (updateDto.mediaType === MediaType.TEXT && oldMediaUrl) {
        updateDto.mediaUrl = '';
      }

      // 4. Mettre à jour le post dans la base de données
      const updatedPost = await this.postRepository.update(postId, updateDto);

      // 5. Supprimer l'ancien média si un nouveau a été uploadé avec succès
      if (uploadedFileUrl && oldMediaUrl) {
        await this.deleteOldMedia(oldMediaUrl);
      }

      this.logger.log(
        `Post updated successfully - ID: ${postId}, New Title: "${updatedPost.getTitle()}"`,
      );

      return updatedPost;
    } catch (error) {
      // Rollback: supprimer le nouveau fichier uploadé en cas d'erreur
      if (uploadedFileId) {
        await this.rollbackFileUpload(uploadedFileId);
      }

      this.logger.error(`Failed to update post: ${error.message}`, error.stack);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Échec de la mise à jour du post. Veuillez réessayer.',
        {
          cause: error,
          description: error.message,
        },
      );
    }
  }

  /**
   * Valide la cohérence entre mediaType et fichier
   */
  private validateMediaTypeWithFile(
    mediaType: MediaType,
    file: Express.Multer.File,
  ): void {
    if (mediaType === MediaType.TEXT && file) {
      throw new BadRequestException(
        'Aucun fichier ne doit être fourni pour un post sans média',
      );
    }

    if (mediaType === MediaType.IMAGE) {
      this.validateImageFile(file);
    }

    if (mediaType === MediaType.VIDEO) {
      this.validateVideoFile(file);
    }
  }

  /**
   * Valide que le fichier est une image
   */
  private validateImageFile(file: Express.Multer.File): void {
    const validImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!validImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier invalide. Les images acceptées sont: JPG, PNG, WebP, GIF`,
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `La taille de l'image ne peut pas dépasser 10 MB`,
      );
    }
  }

  /**
   * Valide que le fichier est une vidéo
   */
  private validateVideoFile(file: Express.Multer.File): void {
    const validVideoTypes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
    ];

    if (!validVideoTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier invalide. Les vidéos acceptées sont: MP4, MOV, AVI, MKV`,
      );
    }

    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `La taille de la vidéo ne peut pas dépasser 100 MB`,
      );
    }
  }

  /**
   * Upload le média vers le service de stockage
   */
  private async uploadMedia(
    file: Express.Multer.File,
    mediaType: MediaType,
  ): Promise<{ url: string; fileId: string }> {
    try {
      const resourceType = this.getResourceType(mediaType);

      this.logger.log(
        `Uploading ${resourceType}: ${file.originalname} (${this.formatFileSize(file.size)})`,
      );

      const uploadedUrl = await this.fileUploader.upload(file, resourceType);
      const fileId = this.extractFileIdFromUrl(uploadedUrl);

      return {
        url: uploadedUrl,
        fileId: fileId || uploadedUrl,
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload media: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Échec de l'upload du fichier: ${error.message}`,
      );
    }
  }

  /**
   * Détermine le type de ressource pour l'upload
   */
  private getResourceType(mediaType: MediaType): 'image' | 'video' {
    switch (mediaType) {
      case MediaType.IMAGE:
        return 'image';
      case MediaType.VIDEO:
        return 'video';
      default:
        throw new BadRequestException(
          `Type de média non supporté pour l'upload: ${mediaType}`,
        );
    }
  }

  /**
   * Extrait le fileId de l'URL
   */
  private extractFileIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex((part) => part === 'upload');

      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        const pathParts = parts.slice(uploadIndex + 2);
        const fullPath = pathParts.join('/');
        return fullPath.replace(/\.[^/.]+$/, '');
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Supprime l'ancien média
   */
  private async deleteOldMedia(mediaUrl: string): Promise<void> {
    try {
      const fileId = this.extractFileIdFromUrl(mediaUrl);
      if (fileId) {
        this.logger.log(`Deleting old media - FileId: ${fileId}`);
        await this.fileUploader.delete(fileId, 'image');
        this.logger.log(`Old media deleted successfully`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete old media - URL: ${mediaUrl}, Error: ${error.message}`,
        error.stack,
      );
      // Ne pas faire échouer la mise à jour si la suppression échoue
    }
  }

  /**
   * Annule l'upload en supprimant le fichier
   */
  private async rollbackFileUpload(fileId: string): Promise<void> {
    try {
      this.logger.warn(`Rolling back file upload - FileId: ${fileId}`);
      await this.fileUploader.delete(fileId, 'image');
      this.logger.log(`File deleted successfully - FileId: ${fileId}`);
    } catch (error) {
      this.logger.error(
        `Failed to rollback file upload - FileId: ${fileId}, Error: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Formate la taille du fichier pour les logs
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// ==========================================
// 3. Controller - Ajouter cette méthode
// ==========================================
/*
Dans votre PostController, ajoutez:

import { Param } from '@nestjs/common';
import { UpdatePostUseCase } from '../application/use-cases/update-post.usecase';


*/
