import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserWatchlist,
  WatchlistType,
} from '../entities/user-watchlist.entity';
import { User } from '../entities/user.entity';
import { Movie } from '../entities/movie.entity';
import { CreateWatchlistDto } from 'src/dtos/watchlist.dto';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(UserWatchlist)
    private watchlistRepository: Repository<UserWatchlist>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async addToWatchlist(
    userId: number,
    createWatchlistDto: CreateWatchlistDto,
  ): Promise<UserWatchlist> {
    const { movieId, type } = createWatchlistDto;

    // Check if movie exists
    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
    });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    // Check if item already exists in watchlist
    const existingItem = await this.watchlistRepository.findOne({
      where: { user: { id: userId }, movie: { id: movieId } },
    });

    if (existingItem) {
      // Update existing item type if different
      if (existingItem.type !== type && type !== undefined) {
        existingItem.type = type;
        return await this.watchlistRepository.save(existingItem);
      }
      throw new ConflictException(
        `Movie is already in your ${type === WatchlistType.FAVORITE ? 'favorites' : 'watchlist'}`,
      );
    }

    const watchlistItem = this.watchlistRepository.create({
      type,
      user: { id: userId } as User,
      movie: { id: movieId } as Movie,
    });

    return await this.watchlistRepository.save(watchlistItem);
  }

  async removeFromWatchlist(
    userId: number,
    watchlistId: number,
  ): Promise<void> {
    const watchlistItem = await this.watchlistRepository.findOne({
      where: { id: watchlistId },
      relations: ['user'],
    });

    if (!watchlistItem) {
      throw new NotFoundException(
        `Watchlist item with ID ${watchlistId} not found`,
      );
    }

    if (watchlistItem.user.id !== userId) {
      throw new ForbiddenException(
        'You can only remove items from your own watchlist',
      );
    }

    await this.watchlistRepository.remove(watchlistItem);
  }

  async getUserWatchlist(
    userId: number,
    type?: WatchlistType,
  ): Promise<UserWatchlist[]> {
    const queryBuilder = this.watchlistRepository
      .createQueryBuilder('watchlist')
      .leftJoinAndSelect('watchlist.movie', 'movie')
      .leftJoinAndSelect('movie.genres', 'genre')
      .where('watchlist.user.id = :userId', { userId })
      .orderBy('watchlist.createdAt', 'DESC');

    if (type) {
      queryBuilder.andWhere('watchlist.type = :type', { type });
    }

    return await queryBuilder.getMany();
  }

  async isMovieInWatchlist(
    userId: number,
    movieId: number,
    type?: WatchlistType,
  ): Promise<boolean> {
    const whereConditions: any = {
      user: { id: userId },
      movie: { id: movieId },
    };

    if (type) {
      whereConditions.type = type;
    }

    const item = await this.watchlistRepository.findOne({
      where: whereConditions,
    });

    return !!item;
  }

  async getWatchlistStats(userId: number): Promise<{
    totalWatchlist: number;
    totalFavorites: number;
  }> {
    const [totalWatchlist, totalFavorites] = await Promise.all([
      this.watchlistRepository.count({
        where: { user: { id: userId }, type: WatchlistType.WATCHLIST },
      }),
      this.watchlistRepository.count({
        where: { user: { id: userId }, type: WatchlistType.FAVORITE },
      }),
    ]);

    return {
      totalWatchlist,
      totalFavorites,
    };
  }
}
