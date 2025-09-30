import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { User } from '../entities/user.entity';
import { Movie } from '../entities/movie.entity';
import { CreateRatingDto, UpdateRatingDto } from '../dtos/rating.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async create(
    userId: number,
    createRatingDto: CreateRatingDto,
  ): Promise<Rating> {
    const { movieId, rating, review } = createRatingDto;

    // Check if movie exists
    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
    });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    // Check if user already rated this movie
    const existingRating = await this.ratingRepository.findOne({
      where: { user: { id: userId }, movie: { id: movieId } },
    });

    if (existingRating) {
      throw new ConflictException('You have already rated this movie');
    }

    const newRating = this.ratingRepository.create({
      rating,
      review,
      user: { id: userId } as User,
      movie: { id: movieId } as Movie,
    });

    return await this.ratingRepository.save(newRating);
  }

  async update(
    userId: number,
    ratingId: number,
    updateRatingDto: UpdateRatingDto,
  ): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['user'],
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${ratingId} not found`);
    }

    if (rating.user.id !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    Object.assign(rating, updateRatingDto);
    return await this.ratingRepository.save(rating);
  }

  async delete(userId: number, ratingId: number): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      relations: ['user'],
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${ratingId} not found`);
    }

    if (rating.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own ratings');
    }

    await this.ratingRepository.remove(rating);
  }

  async findByUser(userId: number): Promise<Rating[]> {
    return await this.ratingRepository.find({
      where: { user: { id: userId } },
      relations: ['movie', 'movie.genres'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByMovie(movieId: number): Promise<Rating[]> {
    return await this.ratingRepository.find({
      where: { movie: { id: movieId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRating(movieId: number): Promise<number> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .where('rating.movieId = :movieId', { movieId })
      .getRawOne();

    return result?.average ? parseFloat(result.average) : 0;
  }

  async getUserRatingForMovie(
    userId: number,
    movieId: number,
  ): Promise<Rating | null> {
    return await this.ratingRepository.findOne({
      where: { user: { id: userId }, movie: { id: movieId } },
      relations: ['user', 'movie'],
    });
  }
}
