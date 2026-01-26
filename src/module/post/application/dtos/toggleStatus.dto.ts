// src/posts/dto/toggle-post-status.dto.ts
import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TogglePostStatusDto {
  @ApiProperty({
    description: 'Statut de publication du post',
    example: true,
  })
  @IsBoolean({ message: 'Le statut doit être un booléen' })
  isPublished: boolean;
}
