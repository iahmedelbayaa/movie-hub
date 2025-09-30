import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRatingDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  movieId: number;

  @IsNotEmpty()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating: number;

  @IsOptional()
  @IsString()
  review?: string;
}

export class UpdateRatingDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  rating?: number;

  @IsOptional()
  @IsString()
  review?: string;
}

export class RatingResponseDto {
  id: number;
  rating: number;
  review: string;
  createdAt: Date;
  user: {
    id: number;
    username: string;
  };
  movie: {
    id: number;
    title: string;
  };
}
