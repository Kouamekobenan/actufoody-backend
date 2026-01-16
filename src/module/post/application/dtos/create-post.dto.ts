import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateIf,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MediaType } from '../../domain/enums/media.enum';

export class CreatePostDto {
  @ApiProperty({
    description: 'Titre du post',
    example: 'Découvrez notre nouvelle collection',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional({
    description: 'Contenu du post en texte enrichi ou markdown',
    example: 'Voici le contenu détaillé de notre nouveau post...',
    required: false,
  })
  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  @IsOptional()
  @Transform(({ value }) => (value?.trim() === '' ? undefined : value?.trim()))
  content?: string;

  @ApiProperty({
    description: 'Type de média associé au post',
    enum: MediaType,
    enumName: 'MediaType',
    example: MediaType.IMAGE,
  })
  @IsEnum(MediaType, {
    message: 'Le type de média doit être IMAGE, VIDEO ou NONE',
  })
  @IsNotEmpty({ message: 'Le type de média est obligatoire' })
  @Transform(({ value }) => value?.toUpperCase())
  mediaType: MediaType;
  @ApiPropertyOptional({
    description: 'URL du média (image ou vidéo)',
    example: 'https://example.com/images/post-image.jpg',
    nullable: true,
  })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: "L'URL du média doit être une URL valide" },
  )
  @IsOptional()
  mediaUrl?: string;
  @ApiPropertyOptional({
    description: 'ID de la catégorie à laquelle appartient le post',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.categoryId !== undefined &&
      o.categoryId !== '' &&
      o.categoryId !== null,
  )
  // @IsUUID('4', { message: "L'ID de la catégorie doit être un UUID valide" })
  @Transform(({ value }) =>
    value === '' || value === 'null' ? undefined : value,
  )
  categoryId?: string;

  @ApiProperty({
    description: "ID de l'administrateur créant le post",
    example: '987fcdeb-51a2-43f7-b789-123456789abc',
    format: 'uuid',
  })
  @IsNotEmpty({ message: "L'ID de l'administrateur est obligatoire" })
  // @IsUUID('4', { message: "L'ID de l'administrateur doit être un UUID valide" })
  adminId: string;

  @ApiProperty({
    description: 'Indique si le post est publié ou en brouillon',
    example: true,
    default: false,
  })
  @IsBoolean({ message: 'isPublished doit être un booléen' })
  @Transform(({ value }) => {
    // Gère les multiples formats possibles
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    if (typeof value === 'number') return value === 1;
    return false;
  })
  @Type(() => Boolean)
  isPublished: boolean;
}

