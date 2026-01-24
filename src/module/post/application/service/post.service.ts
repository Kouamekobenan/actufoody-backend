import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  type IPostRepository,
  PostRepositoryName,
} from '../../domain/interface/post.repository';
import { CreatePostDto } from '../dtos/create-post.dto';
import { Post } from '../../domain/entities/post.entity';
import { MediaType } from '../../domain/enums/media.enum';
import {
  type FileUploader,
  FileUploaderName,
} from 'src/common/cloudinary/file-upload.interface';

@Injectable()
export class CreatePostUseCase {
  private readonly logger = new Logger(CreatePostUseCase.name);
  constructor(
    @Inject(PostRepositoryName)
    private readonly postRepository: IPostRepository,
    @Inject(FileUploaderName)
    private readonly fileUploader: FileUploader,
  ) {}
  async execute(
    createDto: CreatePostDto,
    file?: Express.Multer.File,
  ): Promise<Post> {
    let uploadedFileUrl: string | undefined;
    let uploadedFileId: string | undefined;
    try {
      // 1. Valider les données d'entrée
      this.validateInput(createDto, file);
      // 2. Upload du média si fichier présent
      if (file) {
        const uploadResult = await this.uploadMedia(file, createDto.mediaType);
        uploadedFileUrl = uploadResult.url;
        uploadedFileId = uploadResult.fileId;
        this.logger.log(
          `Media uploaded successfully - URL: ${uploadedFileUrl}, FileId: ${uploadedFileId}`,
        );
      }
      // 3. Créer le post dans la base de données
      const post = await this.postRepository.create({
        ...createDto,
        mediaUrl: uploadedFileUrl,
      });

      this.logger.log(
        `Post created successfully - ID: ${post.getId()}, Title: "${post.getTitle()}"`,
      );

      return post;
    } catch (error) {
      // Rollback: supprimer le fichier uploadé en cas d'erreur
      if (uploadedFileId) {
        await this.rollbackFileUpload(uploadedFileId);
      }
      this.logger.error(`Failed to create post: ${error.message}`, error.stack);
      // Renvoyer une erreur appropriée
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Échec de la création du post. Veuillez réessayer.',
        {
          cause: error,
          description: error.message,
        },
      );
    }
  }
  /**
   * Valide les données d'entrée avant de créer le post
   */
  private validateInput(
    createDto: CreatePostDto,
    file?: Express.Multer.File,
  ): void {
    // Vérifier la cohérence entre mediaType et fichier
    const requiresFile =
      createDto.mediaType === MediaType.IMAGE ||
      createDto.mediaType === MediaType.VIDEO;

    if (requiresFile && !file) {
      throw new BadRequestException(
        `Un fichier ${createDto.mediaType.toLowerCase()} est requis pour ce type de post`,
      );
    }

    if (createDto.mediaType === MediaType.TEXT && file) {
      throw new BadRequestException(
        'Aucun fichier ne doit être fourni pour un post sans média',
      );
    }
    // Vérifier qu'il y a du contenu (texte ou média)
    if (!createDto.content && !file) {
      throw new BadRequestException(
        'Le post doit contenir du texte ou un média',
      );
    }
    // Validation de la taille du fichier si présent
    if (file) {
      this.validateFileSize(file, createDto.mediaType);
    }
  }

  /**
   * Valide la taille du fichier selon le type
   */
  private validateFileSize(
    file: Express.Multer.File,
    mediaType: MediaType,
  ): void {
    const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 10 MB
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

    if (mediaType === MediaType.IMAGE && file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        "La taille de l'image ne peut pas dépasser 15 MB veillez choisir une autre image",
      );
    }

    if (mediaType === MediaType.VIDEO && file.size > MAX_VIDEO_SIZE) {
      throw new BadRequestException(
        'La taille de la vidéo ne peut pas dépasser 100 MB',
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

      // Extraire le fileId de l'URL (adapter selon votre service)
      const fileId = this.extractFileIdFromUrl(uploadedUrl);

      return {
        url: uploadedUrl,
        fileId: fileId || uploadedUrl,
      };
    } catch (error) {
      this.logger.error({
        message: `Failed to create post: ${error.message}`,
        stack: error.stack,
      });
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
   * Extrait le fileId de l'URL (à adapter selon votre service)
   */
  private extractFileIdFromUrl(url: string): string | null {
    try {
      // Exemple pour Cloudinary: extraire le public_id
      // https://res.cloudinary.com/demo/image/upload/v1234567890/posts/sample.jpg
      // FileId: posts/sample
      const parts = url.split('/');
      const uploadIndex = parts.findIndex((part) => part === 'upload');

      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        // Ignorer la version (v1234567890)
        const pathParts = parts.slice(uploadIndex + 2);
        const fullPath = pathParts.join('/');
        // Retirer l'extension
        return fullPath.replace(/\.[^/.]+$/, '');
      }

      return null;
    } catch {
      return null;
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
      // Ne pas faire échouer le processus principal
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
