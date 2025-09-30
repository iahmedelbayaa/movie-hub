import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RatingService } from './rate.service';
import { Rating } from '../entities/rating.entity';
import { Movie } from '../entities/movie.entity';
import { CreateRatingDto, UpdateRatingDto } from '../dtos/rating.dto';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

describe('RatingService', () => {
  let service: RatingService;
  let ratingRepository: Repository<Rating>;
  let movieRepository: Repository<Movie>;

  const mockUser = { id: 1, username: 'testuser' };
  const mockMovie = { id: 1, title: 'Test Movie' };
  const mockRating = {
    id: 1,
    rating: 8,
    review: 'Great movie!',
    user: mockUser,
    movie: mockMovie,
    createdAt: new Date(),
  };

  const mockRatingRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMovieRepository = {
    findOne: jest.fn(),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        {
          provide: getRepositoryToken(Rating),
          useValue: mockRatingRepository,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    ratingRepository = module.get<Repository<Rating>>(
      getRepositoryToken(Rating),
    );
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));

    mockRatingRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new rating successfully', async () => {
      const createRatingDto: CreateRatingDto = {
        movieId: 1,
        rating: 8,
        review: 'Great movie!',
      };

      mockMovieRepository.findOne.mockResolvedValue(mockMovie);
      mockRatingRepository.findOne.mockResolvedValue(null);
      mockRatingRepository.create.mockReturnValue(mockRating);
      mockRatingRepository.save.mockResolvedValue(mockRating);

      const result = await service.create(1, createRatingDto);

      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRatingRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 }, movie: { id: 1 } },
      });
      expect(mockRatingRepository.create).toHaveBeenCalled();
      expect(mockRatingRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockRating);
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      const createRatingDto: CreateRatingDto = {
        movieId: 999,
        rating: 8,
        review: 'Great movie!',
      };

      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.create(1, createRatingDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if user already rated the movie', async () => {
      const createRatingDto: CreateRatingDto = {
        movieId: 1,
        rating: 8,
        review: 'Great movie!',
      };

      mockMovieRepository.findOne.mockResolvedValue(mockMovie);
      mockRatingRepository.findOne.mockResolvedValue(mockRating);

      await expect(service.create(1, createRatingDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update a rating successfully', async () => {
      const updateRatingDto: UpdateRatingDto = {
        rating: 9,
        review: 'Amazing movie!',
      };

      const updatedRating = { ...mockRating, ...updateRatingDto };
      mockRatingRepository.findOne.mockResolvedValue(mockRating);
      mockRatingRepository.save.mockResolvedValue(updatedRating);

      const result = await service.update(1, 1, updateRatingDto);

      expect(mockRatingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(mockRatingRepository.save).toHaveBeenCalled();
      expect(result.rating).toBe(9);
    });

    it('should throw NotFoundException if rating does not exist', async () => {
      const updateRatingDto: UpdateRatingDto = {
        rating: 9,
      };

      mockRatingRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, 999, updateRatingDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user tries to update another user's rating", async () => {
      const updateRatingDto: UpdateRatingDto = {
        rating: 9,
      };

      const otherUserRating = { ...mockRating, user: { id: 2 } };
      mockRatingRepository.findOne.mockResolvedValue(otherUserRating);

      await expect(service.update(1, 1, updateRatingDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getAverageRating', () => {
    it('should return average rating for a movie', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({ average: '8.5' });

      const result = await service.getAverageRating(1);

      expect(mockRatingRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toBe(8.5);
    });

    it('should return 0 if no ratings exist', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(null);

      const result = await service.getAverageRating(1);

      expect(result).toBe(0);
    });
  });
});
