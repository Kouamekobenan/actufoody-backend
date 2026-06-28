import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jean Dupont', description: 'Nouveau nom' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ example: 'jean@exemple.com', description: 'Nouvel email' })
  @IsOptional()
  @IsEmail({}, { message: "L'email doit être valide" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;
}
