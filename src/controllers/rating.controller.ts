import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RatingService } from '../services/rate.service';
import { CreateRatingDto, UpdateRatingDto } from '../dtos/rating.dto';

@Controller('ratings')
@UseGuards(AuthGuard('jwt'))
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  async create(@Request() req: any, @Body() createRatingDto: CreateRatingDto) {
    return this.ratingService.create(req.user.id, createRatingDto);
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingService.update(req.user.id, id, updateRatingDto);
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.ratingService.delete(req.user.id, id);
    return { message: 'Rating deleted successfully' };
  }

  @Get('my-ratings')
  async getUserRatings(@Request() req: any) {
    return this.ratingService.findByUser(req.user.id);
  }

  @Get('movie/:movieId')
  async getMovieRatings(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.ratingService.findByMovie(movieId);
  }

  @Get('movie/:movieId/average')
  async getAverageRating(@Param('movieId', ParseIntPipe) movieId: number) {
    const average = await this.ratingService.getAverageRating(movieId);
    return { averageRating: average };
  }

  @Get('movie/:movieId/my-rating')
  async getUserRatingForMovie(
    @Request() req: any,
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    return this.ratingService.getUserRatingForMovie(req.user.id, movieId);
  }
}
