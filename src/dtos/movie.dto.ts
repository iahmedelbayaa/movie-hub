import {
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetMoviesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map(Number) : value,
  )
  genres?: number[];

  @IsOptional()
  @IsString()
  @IsEnum(['title', 'release_date', 'vote_average', 'popularity'])
  sortBy?: string = 'popularity';

  @IsOptional()
  @IsString()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class MovieResponseDto {
  id: number;
  tmdbId: number;
  title: string;
  overview: string;
  releaseDate: Date;
  posterPath: string;
  backdropPath: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  originalLanguage: string;
  originalTitle: string;
  adult: boolean;
  runtime: number;
  tagline: string;
  genres: { id: number; name: string }[];
  averageRating?: number;
}
