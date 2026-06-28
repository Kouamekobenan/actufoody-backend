import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Joi from 'joi';

// Database
import { PrismaModule } from './common/database/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/auth/users/user.module';
import { CategoryModule } from './module/categories/category.module';
import { PostModule } from './module/post/post.module';
import { TagModule } from './module/tag/tag.module';
import { CommentModule } from './module/comment/comment.module';
import { LikeModule } from './module/like/like.module';
import { StatsModule } from './module/stats/stats.module';

@Module({
  imports: [
    // Configuration + validation des variables d'environnement au démarrage
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_EXPIRY: Joi.string().default('7d'),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
      }),
    }),
    // Rate limiting : 100 requêtes / minute par IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    // Logger
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),

    // Database

    // Auth
    AuthModule,

    // Business modules
    UserModule,
    CategoryModule,
    PostModule,
    TagModule,
    CommentModule,
    LikeModule,
    StatsModule,
  ],
})
export class AppModule {}
