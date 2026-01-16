import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUrl,
  IsUUID,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MediaType } from '../../domain/enums/media.enum';

export class UpdatePostDto {
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
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Contenu du post en texte enrichi ou markdown',
    example: 'Voici le contenu détaillé de notre nouveau post...',
    nullable: true,
  })
  @IsString({ message: 'Le contenu doit être une chaîne de caractères' })
  @IsOptional()
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
  @IsOptional()
  mediaType?: MediaType;

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
  mediaUrl: string ;

  @ApiProperty({
    description: 'ID de la catégorie à laquelle appartient le post',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  // @IsUUID('4', { message: "L'ID de la catégorie doit être un UUID valide" })
  @IsNotEmpty({ message: "L'ID de la catégorie est obligatoire" })
  @IsOptional()
  categoryId?: string;
  @ApiProperty({
    description: 'Indique si le post est publié ou en brouillon',
    example: true,
    default: false,
  })
  @IsBoolean({ message: 'isPublished doit être un booléen' })
  @IsNotEmpty({ message: 'Le statut de publication est obligatoire' })
  @IsOptional()
  isPublished?: boolean;
}
