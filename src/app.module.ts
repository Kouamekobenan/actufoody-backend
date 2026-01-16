import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

// Database
import { PrismaModule } from './common/database/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/auth/users/user.module';
import { CategoryModule } from './module/categories/category.module';
import { PostModule } from './module/post/post.module';

// Auth

// Modules

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
  ],
})
export class AppModule {}
