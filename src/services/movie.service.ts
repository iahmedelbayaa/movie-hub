import {
  Injectable,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Movie } from '../entities/movie.entity';
import { Genre } from '../entities/genre.entity';
import { TmdbService } from './tmdb.service';
import { GetMoviesDto } from '../dtos/movie.dto';

@Injectable()
export class MovieService implements OnModuleInit {
  private readonly logger = new Logger(MovieService.name);
  constructor(
    @InjectRepository(Movie) private movieRepository: Repository<Movie>,
    @InjectRepository(Genre) private genreRepository: Repository<Genre>,
    private tmdbService: TmdbService,
  ) {}

  async onModuleInit() {
    await this.syncGenresFromTmdb();
    await this.syncMoviesFromTmdb();
  }

  async findAll(query: GetMoviesDto) {
    const {
      page = 1,
      limit = 10,
      search,
      genres,
      sortBy = 'popularity',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.createQueryBuilder();

    // Add search filter
    if (search) {
      queryBuilder.andWhere(
        '(movie.title ILIKE :search OR movie.overview ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Add genre filter
    if (genres && genres.length > 0) {
      queryBuilder
        .innerJoin('movie.genres', 'filterGenre')
        .andWhere('filterGenre.id IN (:...genreIds)', { genreIds: genres });
    }

    // Add sorting
    const sortField = this.mapSortField(sortBy);
    queryBuilder.orderBy(`movie.${sortField}`, sortOrder);

    // Add pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [movies, total] = await queryBuilder.getManyAndCount();

    // Calculate average rating for each movie
    const moviesWithRating = await Promise.all(
      movies.map(async (movie) => {
        const averageRating = await this.calculateAverageRating(movie.id);
        return { ...movie, averageRating };
      }),
    );

    return {
      data: moviesWithRating,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['genres', 'ratings', 'ratings.user'],
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    // Calculate average rating
    movie.averageRating = await this.calculateAverageRating(id);

    return movie;
  }

  async findByTmdbId(tmdbId: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: { tmdbId },
      relations: ['genres'],
    });

    if (!movie) {
      throw new NotFoundException(`Movie with TMDB ID ${tmdbId} not found`);
    }

    return movie;
  }

  // Sync genres from TMDB (run once on startup)
  private async syncGenresFromTmdb(): Promise<void> {
    try {
      this.logger.log('Syncing genres from TMDB...');
      const tmdbGenres = await this.tmdbService.getGenres();

      for (const tmdbGenre of tmdbGenres.genres) {
        const existingGenre = await this.genreRepository.findOne({
          where: { tmdbId: tmdbGenre.id },
        });

        if (!existingGenre) {
          const genre = this.genreRepository.create({
            tmdbId: tmdbGenre.id,
            name: tmdbGenre.name,
          });
          await this.genreRepository.save(genre);
        }
      }

      this.logger.log(`Synced ${tmdbGenres.genres.length} genres from TMDB`);
    } catch (error) {
      this.logger.error('Failed to sync genres from TMDB', error);
    }
  }

  // Sync movies from TMDB (run on startup and periodically)
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  private async syncMoviesFromTmdb(): Promise<void> {
    try {
      this.logger.log('Syncing movies from TMDB...');

      // Fetch popular movies (first 5 pages)
      for (let page = 1; page <= 5; page++) {
        const popularMovies = await this.tmdbService.getPopularMovies(page);
        await this.saveMoviesFromTmdb(popularMovies.results);
      }

      // Fetch top rated movies (first 3 pages)
      for (let page = 1; page <= 3; page++) {
        const topRatedMovies = await this.tmdbService.getTopRatedMovies(page);
        await this.saveMoviesFromTmdb(topRatedMovies.results);
      }

      this.logger.log('Successfully synced movies from TMDB');
    } catch (error) {
      this.logger.error('Failed to sync movies from TMDB', error);
    }
  }

  private async saveMoviesFromTmdb(tmdbMovies: any[]): Promise<void> {
    for (const tmdbMovie of tmdbMovies) {
      try {
        const existingMovie = await this.movieRepository.findOne({
          where: { tmdbId: tmdbMovie.id },
        });

        if (existingMovie) {
          // Update existing movie
          await this.updateMovieFromTmdb(existingMovie, tmdbMovie);
        } else {
          // Create new movie
          await this.createMovieFromTmdb(tmdbMovie);
        }
      } catch (error) {
        this.logger.error(`Failed to save movie ${tmdbMovie.id}`, error);
      }
    }
  }

  private async createMovieFromTmdb(tmdbMovie: any): Promise<Movie> {
    // Get detailed movie info
    const movieDetails = await this.tmdbService.getMovieDetails(tmdbMovie.id);

    const movie = this.movieRepository.create({
      tmdbId: movieDetails.id,
      title: movieDetails.title,
      overview: movieDetails.overview,
      releaseDate: movieDetails.release_date
        ? new Date(movieDetails.release_date)
        : undefined,
      posterPath: movieDetails.poster_path,
      backdropPath: movieDetails.backdrop_path,
      voteAverage: movieDetails.vote_average,
      voteCount: movieDetails.vote_count,
      popularity: movieDetails.popularity,
      originalLanguage: movieDetails.original_language,
      originalTitle: movieDetails.original_title,
      adult: movieDetails.adult,
      runtime: movieDetails.runtime,
      budget: movieDetails.budget,
      revenue: movieDetails.revenue,
      tagline: movieDetails.tagline,
    });

    const savedMovie = await this.movieRepository.save(movie);

    // Associate genres
    if (movieDetails.genres && movieDetails.genres.length > 0) {
      const genreIds = movieDetails.genres.map((g) => g.id);
      const genres = await this.genreRepository.find({
        where: { tmdbId: In(genreIds) },
      });
      savedMovie.genres = genres;
      await this.movieRepository.save(savedMovie);
    }

    return savedMovie;
  }

  private async updateMovieFromTmdb(
    movie: Movie,
    tmdbMovie: any,
  ): Promise<void> {
    // Update basic fields
    movie.voteAverage = tmdbMovie.vote_average;
    movie.voteCount = tmdbMovie.vote_count;
    movie.popularity = tmdbMovie.popularity;

    await this.movieRepository.save(movie);
  }

  private createQueryBuilder(): SelectQueryBuilder<Movie> {
    return this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genre')
      .where('movie.active = :active', { active: true });
  }

  private mapSortField(sortBy: string): string {
    const fieldMap = {
      title: 'title',
      release_date: 'releaseDate',
      vote_average: 'voteAverage',
      popularity: 'popularity',
    };

    return fieldMap[sortBy] || 'popularity';
  }

  private async calculateAverageRating(movieId: number): Promise<number> {
    const result = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoin('movie.ratings', 'rating')
      .select('AVG(rating.rating)', 'average')
      .where('movie.id = :movieId', { movieId })
      .getRawOne();

    return result?.average ? parseFloat(result.average) : 0;
  }
}
