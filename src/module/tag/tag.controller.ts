import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { SetTagsDto } from './dto/set-tags.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { AdminRole } from '@prisma/client';

@ApiTags('Tags')
@ApiBearerAuth('auth-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister tous les tags avec leur nombre de posts' })
  findAll() {
    return this.tagService.findAll();
  }

  @Public()
  @Get(':name/posts')
  @ApiOperation({ summary: 'Récupérer les posts associés à un tag' })
  @ApiParam({ name: 'name', example: 'fast-food' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPostsByTag(
    @Param('name') name: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.tagService.getPostsByTag(name, +page, +limit);
  }

  @Post(':postId')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.EDITOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Définir les tags d\'un post (remplace les existants) — auth requis' })
  @ApiParam({ name: 'postId', description: 'ID du post' })
  setPostTags(@Param('postId') postId: string, @Body() dto: SetTagsDto) {
    return this.tagService.setPostTags(postId, dto);
  }
}
