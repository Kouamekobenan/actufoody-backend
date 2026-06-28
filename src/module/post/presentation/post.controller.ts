import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
  ParseFilePipe,
  MaxFileSizeValidator,
  Logger,
  BadRequestException,
  Get,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiProduces,
  ApiParam,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/curent-user.decorator';
import { AdminRole } from '@prisma/client';
import { CreatePostDto } from '../application/dtos/create-post.dto';
import { MediaType } from '../domain/enums/media.enum';
import { CustomFileTypeValidator } from 'src/common/custom-file-type.validator';
import { CreatePostUseCase } from '../application/service/post.service';
import { FindOnePostUseCase } from '../application/service/findOne-post.useCase';
import { Post as posts } from '../domain/entities/post.entity';
import { DeletePostUseCase } from '../application/service/delete-post.service';
import { PaginateDto } from '../application/dtos/paginate-post.dto';
import { FindAllPostService } from '../application/service/findAll-post.service';
import { UpdatePostDto } from '../application/dtos/update-post.dto';
import { UpdatePostUseCase } from '../application/service/update-post.service';
import { FindPostByTypeService } from '../application/service/findPost-byType';
import { MediaTypeParamDto } from '../application/dtos/pagineTypeMedia.dto';
import { UpdateIsPublishedUseCase } from '../application/service/update-isPublished.usecase';
import { TogglePostStatusDto } from '../application/dtos/toggleStatus.dto';
import { SearchPostService } from '../application/service/search-post.service';
import { TrendingPostService } from '../application/service/trending-post.service';

@ApiTags('Posts')
@ApiBearerAuth('auth-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('posts')
export class PostController {
  private readonly logger = new Logger(PostController.name);

  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly findOnePostUsecas: FindOnePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly findAllPostService: FindAllPostService,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly findPostByTypeService: FindPostByTypeService,
    private readonly updateIsPublishedUseCase: UpdateIsPublishedUseCase,
    private readonly searchPostService: SearchPostService,
    private readonly trendingPostService: TrendingPostService,
  ) {}

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.EDITOR)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('mediaUrl'))
  @ApiOperation({
    summary: 'Créer un nouveau post',
    description:
      'Crée un post avec du contenu texte et/ou un média (image ou vidéo). Le fichier est uploadé sur Cloudinary.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiBody({
    description: 'Données du post à créer',
    schema: {
      type: 'object',
      required: ['title', 'mediaType', 'adminId', 'isPublished'],
      properties: {
        title: {
          type: 'string',
          description: 'Titre du post',
          example: 'Découvrez notre nouvelle collection',
          minLength: 3,
          maxLength: 200,
        },
        content: {
          type: 'string',
          description: 'Contenu du post (optionnel si média présent)',
          example: 'Voici le contenu détaillé de notre nouveau post...',
          nullable: true,
        },
        mediaType: {
          type: 'string',
          description: 'Type de média du post',
          enum: ['IMAGE', 'VIDEO', 'NONE'],
          example: 'IMAGE',
        },
        mediaFile: {
          type: 'string',
          format: 'binary',
          description:
            'Fichier image (JPG, PNG, WebP) ou vidéo (MP4, MOV, AVI) - Max 10MB pour images, 100MB pour vidéos',
          nullable: true,
        },
        categoryId: {
          type: 'string',
          format: 'uuid',
          description: 'ID de la catégorie (optionnel)',
          example: '123e4567-e89b-12d3-a456-426614174000',
          nullable: true,
        },
        isPublished: {
          type: 'boolean',
          description: 'Indique si le post est publié immédiatement',
          example: true,
          default: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post créé avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Post créé avec succès' },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            title: {
              type: 'string',
              example: 'Découvrez notre nouvelle collection',
            },
            content: { type: 'string', example: 'Voici le contenu...' },
            mediaType: { type: 'string', example: 'IMAGE' },
            mediaUrl: {
              type: 'string',
              example:
                'https://res.cloudinary.com/demo/image/upload/v1234567890/posts/sample.jpg',
            },
            categoryId: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            adminId: {
              type: 'string',
              example: '987fcdeb-51a2-43f7-b789-123456789abc',
            },
            isPublished: { type: 'boolean', example: true },
            publishedAt: {
              type: 'string',
              example: '2025-01-16T10:30:00.000Z',
            },
            updatedAt: { type: 'string', example: '2025-01-16T10:30:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides ou fichier manquant/incorrect',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'Un fichier image est requis pour ce type de post',
        },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erreur serveur lors de la création',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'Échec de la création du post. Veuillez réessayer.',
        },
        error: { type: 'string', example: 'Internal Server Error' },
        statusCode: { type: 'number', example: 500 },
      },
    },
  })
  async createPost(
    @CurrentUser() currentUser: { userId: string; email: string },
    @Body() createPostDto: CreatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 100 * 1024 * 1024,
            message: 'Le fichier ne peut pas dépasser 100 MB',
          }),
          new CustomFileTypeValidator({}),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    try {
      // Injecter l'adminId depuis le token JWT
      createPostDto.adminId = currentUser.userId;

      this.logger.log(
        `Creating post - Title: "${createPostDto.title}", MediaType: ${createPostDto.mediaType}, HasFile: ${!!file}`,
      );

      this.validateFileRequirement(createPostDto.mediaType, file);

      const post = await this.createPostUseCase.execute(createPostDto, file);

      this.logger.log(`Post created successfully - ID: ${post.getId()}`);

      return {
        success: true,
        message: 'Post créé avec succès',
        data: post.toJSON(),
      };
    } catch (error) {
      this.logger.error(`Failed to create post: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Valide que le fichier est cohérent avec le mediaType
   */
  private validateFileRequirement(
    mediaType: MediaType,
    file?: Express.Multer.File,
  ): void {
    const requiresFile =
      mediaType === MediaType.IMAGE || mediaType === MediaType.VIDEO;

    if (requiresFile && !file) {
      throw new BadRequestException(
        `Un fichier ${mediaType.toLowerCase()} est requis pour ce type de post`,
      );
    }

    if (mediaType === MediaType.TEXT && file) {
      throw new BadRequestException(
        'Aucun fichier ne doit être fourni pour un post sans média (mediaType: NONE)',
      );
    }

    // Validation du type de fichier selon mediaType
    if (file && mediaType === MediaType.IMAGE) {
      this.validateImageFile(file);
    }

    if (file && mediaType === MediaType.VIDEO) {
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

    const maxSize = 15 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `La taille de l'image ne peut pas dépasser 15 MB veillez choisir une autre image`,
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

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Recherche full-text dans les posts (titre + contenu)' })
  @ApiQuery({ name: 'q', required: true, description: 'Terme de recherche (min 2 caractères)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(
    @Query('q') q: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.searchPostService.execute(q, +limit, +page);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Posts les plus vus (trending)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de posts (défaut: 10)' })
  async trending(@Query('limit') limit = 10) {
    return this.trendingPostService.execute(+limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un post par son ID' })
  @ApiParam({ name: 'id', example: 'clx123abc' })
  async findOne(@Param('id') id: string): Promise<posts> {
    return await this.findOnePostUsecas.execute(id);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.EDITOR)
  @ApiOperation({ summary: 'Supprimer un post (auth requis)' })
  @ApiParam({ name: 'id', example: 'clx123abc' })
  async deletePost(@Param('id') id: string) {
    return await this.deletePostUseCase.execute(id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister les posts avec pagination' })
  @ApiQuery({
    name: 'page',
    required: true,
    type: Number,
    description: 'Numéro de la page (à partir de 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
    type: Number,
    description: "Nombre d'elements par page",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste paginée des posts',
    type: [posts], // ou un objet si tu retournes un objet avec { data, totalPage, ... }
  })
  @ApiBadRequestResponse({ description: 'Paramètres de pagination invalides' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async paginate(@Query() query: PaginateDto) {
    return await this.findAllPostService.execute(query.limit, query.page);
  }
  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.EDITOR)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('mediaFile'))
  @ApiOperation({
    summary: 'Mettre à jour un post',
    description:
      'Met à jour un post existant. Vous pouvez modifier le texte et/ou remplacer le média.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiProduces('application/json')
  @ApiBody({
    description: 'Données à modifier',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Nouveau titre (optionnel)',
          example: 'Titre modifié',
        },
        content: {
          type: 'string',
          description: 'Nouveau contenu (optionnel)',
          example: 'Contenu modifié...',
        },
        mediaType: {
          type: 'string',
          enum: ['IMAGE', 'VIDEO', 'NONE'],
          description: 'Type de média (optionnel)',
        },
        mediaFile: {
          type: 'string',
          format: 'binary',
          description: 'Nouveau fichier média (optionnel)',
        },
        categoryId: {
          type: 'string',
          format: 'uuid',
          description: 'Nouvelle catégorie (optionnel)',
        },
        isPublished: {
          type: 'boolean',
          description: 'Statut de publication (optionnel)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post mis à jour avec succès',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post introuvable',
  })
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 100 * 1024 * 1024,
            message: 'Le fichier ne peut pas dépasser 100 MB',
          }),
          new CustomFileTypeValidator({}),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    try {
      this.logger.log(`Updating post - ID: ${id}`);

      const post = await this.updatePostUseCase.execute(
        id,
        updatePostDto,
        file,
      );

      this.logger.log(`Post updated successfully - ID: ${id}`);

      return {
        success: true,
        message: 'Post mis à jour avec succès',
        data: post.toJSON(),
      };
    } catch (error) {
      this.logger.error(`Failed to update post: ${error.message}`, error.stack);
      throw error;
    }
  }
  @Public()
  @Get('type/:mediaType')
  @ApiOperation({ summary: 'Récupérer les posts par type de média' })
  @ApiParam({ name: 'mediaType', enum: MediaType, example: 'VIDEO' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findPostByType(
    @Param() params: MediaTypeParamDto,
    @Query() query: PaginateDto,
  ) {
    const mediaType = params.mediaType;
    const { limit, page } = query;
    return await this.findPostByTypeService.execute(mediaType, limit, page);
  }
  @Patch(':id/publish')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.EDITOR)
  @ApiOperation({ summary: "Changer le statut de publication d'un post (auth requis)" })
  @ApiParam({ name: 'id', example: '550e8400-e29b-41d4-a716-446655440000' })
  async updateIsPublished(
    @Param('id') id: string,
    @Body('isPublished') isPublished: TogglePostStatusDto,
  ) {
    return await this.updateIsPublishedUseCase.execute(id, isPublished.isPublished);
  }

}
