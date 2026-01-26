import { IsEnum, IsNotEmpty } from "class-validator";
import { MediaType } from "../../domain/enums/media.enum";
import { Transform } from "class-transformer";

export class MediaTypeParamDto {
  @IsEnum(MediaType, {
    message: 'Le type de média doit être IMAGE, VIDEO ou NONE',
  })
  @IsNotEmpty({ message: 'Le type de média est obligatoire' })
  @Transform(({ value }) => value?.toUpperCase())
    mediaType: MediaType;
}
