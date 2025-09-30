import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { MovieController } from './movie.controller';
import { MovieService } from '../services/movie.service';
import { GetMoviesDto } from '../dtos/movie.dto';

describe('MovieController', () => {
  let controller: MovieController;
  let movieService: MovieService;

  const mockMovieService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockMovieResponse = {
    data: [
      {
        id: 1,
        title: 'Test Movie',
        overview: 'Test overview',
        voteAverage: 8.5,
      },
    ],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          ttl: 300,
        }),
      ],
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: mockMovieService,
        },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
    movieService = module.get<MovieService>(MovieService);
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

      mockMovieService.findAll.mockResolvedValue(mockMovieResponse);

      const result = await controller.findAll(query);

      expect(mockMovieService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockMovieResponse);
    });

    it('should handle search query', async () => {
      const query: GetMoviesDto = {
        page: 1,
        limit: 10,
        search: 'test movie',
      };

      mockMovieService.findAll.mockResolvedValue(mockMovieResponse);

      const result = await controller.findAll(query);

      expect(mockMovieService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockMovieResponse);
    });
  });

  describe('findOne', () => {
    it('should return a single movie', async () => {
      const mockMovie = {
        id: 1,
        title: 'Test Movie',
        overview: 'Test overview',
        averageRating: 8.5,
      };

      mockMovieService.findOne.mockResolvedValue(mockMovie);

      const result = await controller.findOne(1);

      expect(mockMovieService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMovie);
    });
  });
});
