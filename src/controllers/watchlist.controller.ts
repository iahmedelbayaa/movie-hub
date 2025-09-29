import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { WatchlistService } from '../services/watchlist.service';
import { WatchlistType } from '../entities/user-watchlist.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateWatchlistDto } from 'src/dtos/watchlist.dto';

@ApiTags('watchlist')
@Controller('watchlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post()
  @ApiOperation({ summary: 'Add movie to watchlist or favorites' })
  @ApiBody({ type: CreateWatchlistDto })
  @ApiResponse({
    status: 201,
    description: 'Movie added to watchlist successfully',
  })
  @ApiResponse({ status: 409, description: 'Movie already in watchlist' })
  async addToWatchlist(
    @Body(ValidationPipe) createWatchlistDto: CreateWatchlistDto,
    @Request() req: any,
  ) {
    return await this.watchlistService.addToWatchlist(
      req.user.id,
      createWatchlistDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove movie from watchlist' })
  @ApiResponse({
    status: 200,
    description: 'Movie removed from watchlist successfully',
  })
  @ApiResponse({ status: 404, description: 'Watchlist item not found' })
  @ApiResponse({
    status: 403,
    description: 'Cannot remove from other users watchlist',
  })
  async removeFromWatchlist(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    await this.watchlistService.removeFromWatchlist(req.user.id, id);
    return { message: 'Movie removed from watchlist successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get user watchlist' })
  @ApiQuery({ name: 'type', enum: WatchlistType, required: false })
  @ApiResponse({ status: 200, description: 'Watchlist retrieved successfully' })
  async getWatchlist(@Request() req: any, @Query('type') type?: WatchlistType) {
    return await this.watchlistService.getUserWatchlist(req.user.id, type);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get watchlist statistics' })
  @ApiResponse({
    status: 200,
    description: 'Watchlist stats retrieved successfully',
  })
  async getWatchlistStats(@Request() req: any) {
    return await this.watchlistService.getWatchlistStats(req.user.id);
  }

  @Get('check/:movieId')
  @ApiOperation({ summary: 'Check if movie is in watchlist' })
  @ApiQuery({ name: 'type', enum: WatchlistType, required: false })
  @ApiResponse({
    status: 200,
    description: 'Check result retrieved successfully',
  })
  async checkMovieInWatchlist(
    @Param('movieId', ParseIntPipe) movieId: number,
    @Request() req: any,
    @Query('type') type?: WatchlistType,
  ) {
    const isInWatchlist = await this.watchlistService.isMovieInWatchlist(
      req.user.id,
      movieId,
      type,
    );
    return { isInWatchlist };
  }
}
