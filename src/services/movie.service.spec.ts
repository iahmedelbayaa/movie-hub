import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovieService } from './movie.service';
import { TmdbService } from './tmdb.service';
import { Movie } from '../entities/movie.entity';
import { Genre } from '../entities/genre.entity';
import { NotFoundException } from '@nestjs/common';
import { GetMoviesDto } from '../dtos/movie.dto';

describe('MovieService', () => {
  let service: MovieService;
  let movieRepository: Repository<Movie>;
  let genreRepository: Repository<Genre>;
  let tmdbService: TmdbService;

  const mockMovie = {
    id: 1,
    tmdbId: 12345,
    title: 'Test Movie',
    overview: 'Test overview',
    releaseDate: new Date('2023-01-01'),
    voteAverage: 8.5,
    popularity: 100,
    genres: [{ id: 1, name: 'Action' }],
    active: true,
  };

  const mockMovieRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockGenreRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findByIds: jest.fn(),
  };

  const mockTmdbService = {
    getGenres: jest.fn(),
    getPopularMovies: jest.fn(),
    getTopRatedMovies: jest.fn(),
    getMovieDetails: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: getRepositoryToken(Genre),
          useValue: mockGenreRepository,
        },
        {
          provide: TmdbService,
          useValue: mockTmdbService,
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    genreRepository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
    tmdbService = module.get<TmdbService>(TmdbService);

    mockMovieRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated movies', async () => {
      const query: GetMoviesDto = {
        page: 1,
        limit: 10,
      };

      const mockMovies = [mockMovie];
      const mockTotal = 1;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        mockMovies,
        mockTotal,
      ]);
      mockQueryBuilder.getRawOne.mockResolvedValue({ average: '8.5' });

      const result = await service.findAll(query);

      expect(mockMovieRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'movie.popularity',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should apply search filter', async () => {
      const query: GetMoviesDto = {
        page: 1,
        limit: 10,
        search: 'test',
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(movie.title ILIKE :search OR movie.overview ILIKE :search)',
        { search: '%test%' },
      );
    });

    it('should apply genre filter', async () => {
      const query: GetMoviesDto = {
        page: 1,
        limit: 10,
        genres: [1, 2],
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(query);

      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'movie.genres',
        'filterGenre',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'filterGenre.id IN (:...genreIds)',
        { genreIds: [1, 2] },
      );
    });
  });

  describe('findOne', () => {
    it('should return a movie by ID', async () => {
      mockMovieRepository.findOne.mockResolvedValue(mockMovie);
      mockQueryBuilder.getRawOne.mockResolvedValue({ average: '8.5' });

      const result = await service.findOne(1);

      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['genres', 'ratings', 'ratings.user'],
      });
      expect(result).toEqual(
        expect.objectContaining({ ...mockMovie, averageRating: 8.5 }),
      );
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTmdbId', () => {
    it('should return a movie by TMDB ID', async () => {
      mockMovieRepository.findOne.mockResolvedValue(mockMovie);

      const result = await service.findByTmdbId(12345);

      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { tmdbId: 12345 },
        relations: ['genres'],
      });
      expect(result).toEqual(mockMovie);
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.findByTmdbId(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
