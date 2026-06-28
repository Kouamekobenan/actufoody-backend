import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/curent-user.decorator';

@ApiTags('Comments')
@ApiBearerAuth('auth-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('posts/:postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Commenter un post (auth requis)' })
  @ApiParam({ name: 'postId', description: 'ID du post' })
  create(
    @Param('postId') postId: string,
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(postId, user.userId, dto);
  }

  @Public()
  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Lister les commentaires d\'un post' })
  @ApiParam({ name: 'postId' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByPost(
    @Param('postId') postId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.commentService.findByPost(postId, +page, +limit);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un commentaire (propriétaire ou SUPER_ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID du commentaire' })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; role: AdminRole },
  ) {
    return this.commentService.delete(id, user.userId, user.role);
  }
}
