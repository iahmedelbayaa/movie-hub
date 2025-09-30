import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RatingService } from 'src/services/rate.service';
import { CreateRatingDto, UpdateRatingDto } from 'src/dtos/rating.dto';

@ApiTags('ratings')
@Controller('ratings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @ApiOperation({ summary: 'Rate a movie' })
  @ApiBody({ type: CreateRatingDto })
  @ApiResponse({ status: 201, description: 'Rating created successfully' })
  @ApiResponse({ status: 409, description: 'Movie already rated by user' })
  async create(
    @Body(ValidationPipe) createRatingDto: CreateRatingDto,
    @Request() req: any,
  ) {
    return await this.ratingService.create(req.user.id, createRatingDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a rating' })
  @ApiBody({ type: UpdateRatingDto })
  @ApiResponse({ status: 200, description: 'Rating updated successfully' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  @ApiResponse({
    status: 403,
    description: 'Cannot update other users ratings',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateRatingDto: UpdateRatingDto,
    @Request() req: any,
  ) {
    return await this.ratingService.update(req.user.id, id, updateRatingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a rating' })
  @ApiResponse({ status: 200, description: 'Rating deleted successfully' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  @ApiResponse({
    status: 403,
    description: 'Cannot delete other users ratings',
  })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.ratingService.delete(req.user.id, id);
    return { message: 'Rating deleted successfully' };
  }

  @Get('my-ratings')
  @ApiOperation({ summary: 'Get current user ratings' })
  @ApiResponse({
    status: 200,
    description: 'User ratings retrieved successfully',
  })
  async getMyRatings(@Request() req: any) {
    return await this.ratingService.findByUser(req.user.id);
  }

  @Get('movie/:movieId')
  @ApiOperation({ summary: 'Get ratings for a specific movie' })
  @ApiResponse({
    status: 200,
    description: 'Movie ratings retrieved successfully',
  })
  async getMovieRatings(@Param('movieId', ParseIntPipe) movieId: number) {
    return await this.ratingService.findByMovie(movieId);
  }

  @Get('movie/:movieId/average')
  @ApiOperation({ summary: 'Get average rating for a movie' })
  @ApiResponse({
    status: 200,
    description: 'Average rating retrieved successfully',
  })
  async getAverageRating(@Param('movieId', ParseIntPipe) movieId: number) {
    const average = await this.ratingService.getAverageRating(movieId);
    return { average };
  }
}
