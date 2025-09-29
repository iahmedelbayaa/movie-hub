import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Movie } from '../entities/movie.entity';
import { Genre } from '../entities/genre.entity';
import { MovieService } from '../services/movie.service';
import { MovieController } from '../controllers/movie.controller';
import { TmdbService } from '../services/tmdb.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Genre]), ScheduleModule.forRoot()],
  controllers: [MovieController],
  providers: [MovieService, TmdbService],
  exports: [MovieService, TmdbService],
})
export class MovieModule {}
