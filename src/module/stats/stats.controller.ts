import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Stats')
@ApiBearerAuth('auth-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.EDITOR)
  @ApiOperation({
    summary: 'Dashboard administrateur — statistiques globales',
    description:
      'Retourne toutes les métriques clés : vue globale, répartition des posts, top posts, activité récente et derniers commentaires.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques du dashboard',
    schema: {
      type: 'object',
      properties: {
        overview: {
          type: 'object',
          properties: {
            totalPosts:      { type: 'number', example: 48 },
            publishedPosts:  { type: 'number', example: 42 },
            draftPosts:      { type: 'number', example: 6 },
            totalViews:      { type: 'number', example: 12540 },
            totalLikes:      { type: 'number', example: 320 },
            totalComments:   { type: 'number', example: 87 },
            totalAdmins:     { type: 'number', example: 5 },
            totalCategories: { type: 'number', example: 8 },
            totalTags:       { type: 'number', example: 24 },
          },
        },
        posts: {
          type: 'object',
          properties: {
            byMediaType:        { type: 'object', example: { IMAGE: 30, VIDEO: 10, TEXT: 2 } },
            byCategory:         { type: 'array' },
            topViewed:          { type: 'array' },
            topLiked:           { type: 'array' },
            recentlyPublished:  { type: 'array' },
          },
        },
        activity: {
          type: 'object',
          properties: {
            postsThisWeek:    { type: 'number', example: 5 },
            postsThisMonth:   { type: 'number', example: 18 },
            commentsThisWeek: { type: 'number', example: 12 },
            likesThisWeek:    { type: 'number', example: 34 },
          },
        },
        recentComments: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Rôle insuffisant' })
  getDashboard() {
    return this.statsService.getDashboard();
  }
}
