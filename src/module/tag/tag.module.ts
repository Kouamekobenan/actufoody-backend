import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { PrismaService } from 'src/common/database/prisma.service';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  controllers: [TagController],
  providers: [TagService, PrismaService, RolesGuard],
  exports: [TagService],
})
export class TagModule {}
