// src/dispute-categories/interfaces/http/dto/paginate-dispute-category.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';
export class PaginateDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit: number = 10;
}
