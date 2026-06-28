import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/database/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now);
    startOfMonth.setDate(now.getDate() - 30);

    const [
      totalPosts,
      publishedPosts,
      totalAdmins,
      totalCategories,
      totalTags,
      totalComments,
      totalLikes,
      viewsAggregate,
      postsByMediaType,
      postsByCategory,
      topViewedPosts,
      topLikedPosts,
      recentPosts,
      postsThisWeek,
      postsThisMonth,
      commentsThisWeek,
      likesThisWeek,
      recentComments,
    ] = await Promise.all([
      // ── Vue globale ──────────────────────────────────────────
      this.prisma.post.count(),
      this.prisma.post.count({ where: { isPublished: true } }),
      this.prisma.admin.count({ where: { deletedAt: null } }),
      this.prisma.category.count(),
      this.prisma.tag.count(),
      this.prisma.comment.count(),
      this.prisma.like.count(),
      this.prisma.post.aggregate({ _sum: { views: true } }),

      // ── Répartition par type de média ───────────────────────
      this.prisma.post.groupBy({
        by: ['mediaType'],
        _count: { _all: true },
        where: { isPublished: true },
      }),

      // ── Répartition par catégorie (top 10) ──────────────────
      this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { posts: true } },
        },
        orderBy: { posts: { _count: 'desc' } },
        take: 10,
      }),

      // ── Top 5 posts les plus vus ─────────────────────────────
      this.prisma.post.findMany({
        where: { isPublished: true },
        orderBy: { views: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          views: true,
          mediaType: true,
          mediaUrl: true,
          publishedAt: true,
          category: { select: { name: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),

      // ── Top 5 posts les plus likés ───────────────────────────
      this.prisma.post.findMany({
        where: { isPublished: true },
        orderBy: { likes: { _count: 'desc' } },
        take: 5,
        select: {
          id: true,
          title: true,
          views: true,
          mediaType: true,
          mediaUrl: true,
          publishedAt: true,
          category: { select: { name: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),

      // ── 5 posts les plus récents ─────────────────────────────
      this.prisma.post.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          mediaType: true,
          mediaUrl: true,
          views: true,
          publishedAt: true,
          sourceUrl: true,
          category: { select: { name: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),

      // ── Activité ─────────────────────────────────────────────
      this.prisma.post.count({ where: { publishedAt: { gte: startOfWeek } } }),
      this.prisma.post.count({ where: { publishedAt: { gte: startOfMonth } } }),
      this.prisma.comment.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.like.count({ where: { createdAt: { gte: startOfWeek } } }),

      // ── 10 derniers commentaires ─────────────────────────────
      this.prisma.comment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          content: true,
          createdAt: true,
          post: { select: { id: true, title: true } },
          admin: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const mediaTypeMap: Record<string, number> = { IMAGE: 0, VIDEO: 0, TEXT: 0 };
    for (const row of postsByMediaType) {
      mediaTypeMap[row.mediaType] = row._count._all;
    }

    return {
      overview: {
        totalPosts,
        publishedPosts,
        draftPosts: totalPosts - publishedPosts,
        totalViews: viewsAggregate._sum.views ?? 0,
        totalLikes,
        totalComments,
        totalAdmins,
        totalCategories,
        totalTags,
      },
      posts: {
        byMediaType: mediaTypeMap,
        byCategory: postsByCategory.map((c) => ({
          id: c.id,
          name: c.name,
          count: c._count.posts,
        })),
        topViewed: topViewedPosts.map((p) => ({
          id: p.id,
          title: p.title,
          views: p.views,
          mediaType: p.mediaType,
          mediaUrl: p.mediaUrl,
          likesCount: p._count.likes,
          commentsCount: p._count.comments,
          category: p.category?.name ?? null,
          publishedAt: p.publishedAt,
        })),
        topLiked: topLikedPosts.map((p) => ({
          id: p.id,
          title: p.title,
          views: p.views,
          mediaType: p.mediaType,
          mediaUrl: p.mediaUrl,
          likesCount: p._count.likes,
          commentsCount: p._count.comments,
          category: p.category?.name ?? null,
          publishedAt: p.publishedAt,
        })),
        recentlyPublished: recentPosts.map((p) => ({
          id: p.id,
          title: p.title,
          mediaType: p.mediaType,
          mediaUrl: p.mediaUrl,
          views: p.views,
          likesCount: p._count.likes,
          commentsCount: p._count.comments,
          sourceUrl: p.sourceUrl,
          category: p.category?.name ?? null,
          publishedAt: p.publishedAt,
        })),
      },
      activity: {
        postsThisWeek,
        postsThisMonth,
        commentsThisWeek,
        likesThisWeek,
      },
      recentComments: recentComments.map((c) => ({
        id: c.id,
        content: c.content.length > 100 ? c.content.slice(0, 100) + '…' : c.content,
        createdAt: c.createdAt,
        post: { id: c.post.id, title: c.post.title },
        author: { id: c.admin.id, name: c.admin.name, email: c.admin.email },
      })),
    };
  }
}
