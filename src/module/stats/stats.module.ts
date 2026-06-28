import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { PrismaService } from 'src/common/database/prisma.service';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  controllers: [StatsController],
  providers: [StatsService, PrismaService, RolesGuard],
})
export class StatsModule {}
