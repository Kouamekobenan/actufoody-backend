import { Module } from '@nestjs/common';
import { CreatePostUseCase } from './application/service/post.service';
import { PostController } from './presentation/post.controller';
import { PostMapper } from './domain/mappers/post.mapper';
import { PostRepositoryName } from './domain/interface/post.repository';
import { PostRepository } from './infrastructure/post.repository';
import { CloudinaryService } from 'src/common/cloudinary/claudinary.service';
import { FileUploaderName } from 'src/common/cloudinary/file-upload.interface';
import { PrismaService } from 'src/common/database/prisma.service';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { FindOnePostUseCase } from './application/service/findOne-post.useCase';
import { DeletePostUseCase } from './application/service/delete-post.service';
import { FindAllPostService } from './application/service/findAll-post.service';
import { UpdatePostUseCase } from './application/service/update-post.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [PostController],
  providers: [
    // Use Case
    CreatePostUseCase,
    FindOnePostUseCase,
    DeletePostUseCase,
    PrismaService,
    FindAllPostService,
    UpdatePostUseCase,
    // Mapper
    PostMapper,

    // Repository
    {
      provide: PostRepositoryName,
      useClass: PostRepository,
    },

    {
      provide: FileUploaderName,
      useClass: CloudinaryService,
    },
  ],
})
export class PostModule {}
