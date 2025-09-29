import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWatchlist } from '../entities/user-watchlist.entity';
import { Movie } from '../entities/movie.entity';
import { WatchlistService } from '../services/watchlist.service';
import { WatchlistController } from '../controllers/watchlist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserWatchlist, Movie])],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
