import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @ApiProperty({
    description: 'Nom de la catégorie',
    example: 'Plats du jour',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le nom de la catégorie est obligatoire.' })
  @MaxLength(100, { message: 'Le nom ne doit pas dépasser 100 caractères.' })
  name?: string;

  @ApiProperty({
    description: 'Description de la catégorie',
    example: 'Menus disponibles cette semaine.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La description doit être une chaîne de caractères.' })
  @MaxLength(255, {
    message: 'La description ne doit pas dépasser 255 caractères.',
  })
  description?: string;
}
