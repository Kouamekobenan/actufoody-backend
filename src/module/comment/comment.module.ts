import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaService } from 'src/common/database/prisma.service';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  controllers: [CommentController],
  providers: [CommentService, PrismaService, RolesGuard],
})
export class CommentModule {}
