import { Controller, Post, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LikeService } from './like.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/curent-user.decorator';

@ApiTags('Likes')
@ApiBearerAuth('auth-token')
@UseGuards(JwtAuthGuard)
@Controller('posts/:postId')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liker / unliker un post (toggle) — auth requis' })
  @ApiParam({ name: 'postId' })
  toggle(
    @Param('postId') postId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.likeService.toggle(postId, user.userId);
  }

  @Public()
  @Get('likes')
  @ApiOperation({ summary: 'Nombre de likes d\'un post' })
  @ApiParam({ name: 'postId' })
  count(@Param('postId') postId: string) {
    return this.likeService.getLikesCount(postId);
  }
}
