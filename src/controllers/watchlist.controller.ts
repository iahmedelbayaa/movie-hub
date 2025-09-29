import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WatchlistService } from '../services/watchlist.service';
import { CreateWatchlistDto } from '../dtos/watchlist.dto';
import { WatchlistType } from '../entities/user-watchlist.entity';

@Controller('watchlist')
@UseGuards(AuthGuard('jwt'))
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Post()
  async addToWatchlist(
    @Request() req: any,
    @Body() createWatchlistDto: CreateWatchlistDto,
  ) {
    return this.watchlistService.addToWatchlist(
      req.user.id,
      createWatchlistDto,
    );
  }

  @Delete(':id')
  async removeFromWatchlist(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.watchlistService.removeFromWatchlist(req.user.id, id);
    return { message: 'Item removed from watchlist successfully' };
  }

  @Get()
  async getUserWatchlist(
    @Request() req: any,
    @Query('type') type?: WatchlistType,
  ) {
    return this.watchlistService.getUserWatchlist(req.user.id, type);
  }

  @Get('movie/:movieId/check')
  async checkMovieInWatchlist(
    @Request() req: any,
    @Param('movieId', ParseIntPipe) movieId: number,
    @Query('type') type?: WatchlistType,
  ) {
    const isInWatchlist = await this.watchlistService.isMovieInWatchlist(
      req.user.id,
      movieId,
      type,
    );
    return { isInWatchlist };
  }

  @Get('stats')
  async getWatchlistStats(@Request() req: any) {
    return this.watchlistService.getWatchlistStats(req.user.id);
  }
}
