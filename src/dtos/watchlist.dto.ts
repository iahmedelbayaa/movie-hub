import { IsNotEmpty, IsInt, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { WatchlistType } from '../entities/user-watchlist.entity';

export class CreateWatchlistDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  movieId: number;

  @IsOptional()
  @IsEnum(WatchlistType)
  type?: WatchlistType = WatchlistType.WATCHLIST;
}

export class WatchlistResponseDto {
  id: number;
  type: WatchlistType;
  createdAt: Date;
  movie: {
    id: number;
    title: string;
    posterPath: string;
    releaseDate: Date;
  };
}
