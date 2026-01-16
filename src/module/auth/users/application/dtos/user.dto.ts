import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: "Adresse email de l'utilisateur",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'securepassword123',
    description: "Mot de passe de l'utilisateur",
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'Jean Dupont',
    description: "Nom de l'utilisateur",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

}
