import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMaxSize, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class SetTagsDto {
  @ApiProperty({
    description: 'Liste des tags (remplace les tags existants du post)',
    example: ['restauration', 'fast-food', 'paris'],
    type: [String],
  })
  @IsArray()
  @ArrayMaxSize(10, { message: 'Un post ne peut pas avoir plus de 10 tags' })
  @IsString({ each: true })
  @Matches(/^[a-z0-9-]+$/, {
    each: true,
    message: 'Les tags ne peuvent contenir que des lettres minuscules, chiffres et tirets',
  })
  @Transform(({ value }) => (Array.isArray(value) ? value.map((v: string) => v.toLowerCase().trim()) : []))
  tags: string[];
}
