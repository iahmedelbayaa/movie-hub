import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { MovieService } from '../services/movie.service';
import { GetMoviesDto } from '../dtos/movie.dto';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async findAll(@Query() query: GetMoviesDto) {
    return this.movieService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.findOne(id);
  }

  @Get('tmdb/:tmdbId')
  async findByTmdbId(@Param('tmdbId', ParseIntPipe) tmdbId: number) {
    return this.movieService.findByTmdbId(tmdbId);
  }
}
