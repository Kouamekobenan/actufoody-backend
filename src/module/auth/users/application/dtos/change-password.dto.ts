import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'ancienMotDePasse123', description: 'Mot de passe actuel' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NouveauMotDePasse!8', description: 'Nouveau mot de passe (min 8 caractères)' })
  @IsString()
  @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
  newPassword: string;
}
