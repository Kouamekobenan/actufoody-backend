import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @ApiProperty({ example: 'Super article, très informatif !', description: 'Contenu du commentaire' })
  @IsString()
  @IsNotEmpty({ message: 'Le commentaire ne peut pas être vide' })
  @MaxLength(1000, { message: 'Le commentaire ne peut pas dépasser 1000 caractères' })
  @Transform(({ value }) => value?.trim())
  content: string;
}
