import { Test, TestingModule } from '@nestjs/testing';
import { RatingController } from './rating.controller';
import { RatingService } from '../services/rate.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateRatingDto, UpdateRatingDto } from '../dtos/rating.dto';

describe('RatingController', () => {
  let controller: RatingController;
  let ratingService: RatingService;

  const mockRatingService = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByUser: jest.fn(),
    findByMovie: jest.fn(),
    getAverageRating: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockRating = {
    id: 1,
    userId: 1,
    movieId: 1,
    rating: 8.5,
    review: 'Great movie!',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingController],
      providers: [
        {
          provide: RatingService,
          useValue: mockRatingService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RatingController>(RatingController);
    ratingService = module.get<RatingService>(RatingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new rating', async () => {
      const createRatingDto: CreateRatingDto = {
        movieId: 1,
        rating: 8.5,
        review: 'Great movie!',
      };

      const expectedResponse = {
        message: 'Rating created successfully',
        rating: mockRating,
      };

      mockRatingService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createRatingDto, mockRequest);

      expect(mockRatingService.create).toHaveBeenCalledWith(
        mockUser.id,
        createRatingDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle duplicate rating error', async () => {
      const createRatingDto: CreateRatingDto = {
        movieId: 1,
        rating: 8.5,
        review: 'Great movie!',
      };

      const error = new Error('Movie already rated by user');
      mockRatingService.create.mockRejectedValue(error);

      await expect(
        controller.create(createRatingDto, mockRequest),
      ).rejects.toThrow(error);
    });

    it('should validate rating score range', async () => {
      const createRatingDto: CreateRatingDto = {
        movieId: 1,
        rating: 11, // Invalid rating > 10
        review: 'Great movie!',
      };

      const error = new Error('Rating must be between 1 and 10');
      mockRatingService.create.mockRejectedValue(error);

      await expect(
        controller.create(createRatingDto, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update an existing rating', async () => {
      const updateRatingDto: UpdateRatingDto = {
        rating: 9.0,
        review: 'Even better on second watch!',
      };

      const updatedRating = {
        ...mockRating,
        rating: 9.0,
        review: 'Even better on second watch!',
      };

      const expectedResponse = {
        message: 'Rating updated successfully',
        rating: updatedRating,
      };

      mockRatingService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(1, updateRatingDto, mockRequest);

      expect(mockRatingService.update).toHaveBeenCalledWith(
        1,
        mockUser.id,
        updateRatingDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle rating not found error', async () => {
      const updateRatingDto: UpdateRatingDto = {
        rating: 9.0,
      };

      const error = new Error('Rating not found');
      mockRatingService.update.mockRejectedValue(error);

      await expect(
        controller.update(999, updateRatingDto, mockRequest),
      ).rejects.toThrow(error);
    });

    it('should handle unauthorized update attempt', async () => {
      const updateRatingDto: UpdateRatingDto = {
        rating: 9.0,
      };

      const error = new Error('You can only update your own ratings');
      mockRatingService.update.mockRejectedValue(error);

      await expect(
        controller.update(1, updateRatingDto, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete a rating', async () => {
      const expectedResponse = {
        message: 'Rating deleted successfully',
      };

      mockRatingService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(1, mockRequest);

      expect(mockRatingService.delete).toHaveBeenCalledWith(mockUser.id, 1);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle rating not found error', async () => {
      const error = new Error('Rating not found');
      mockRatingService.delete.mockRejectedValue(error);

      await expect(controller.delete(999, mockRequest)).rejects.toThrow(error);
    });

    it('should handle unauthorized delete attempt', async () => {
      const error = new Error('You can only delete your own ratings');
      mockRatingService.delete.mockRejectedValue(error);

      await expect(controller.delete(1, mockRequest)).rejects.toThrow(error);
    });
  });

  describe('getMyRatings', () => {
    it('should return user ratings', async () => {
      const mockRatings = {
        data: [mockRating],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockRatingService.findByUser.mockResolvedValue(mockRatings);

      const result = await controller.getMyRatings(mockRequest);

      expect(mockRatingService.findByUser).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockRatings);
    });

    it('should handle empty ratings list', async () => {
      const mockEmptyRatings = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };

      mockRatingService.findByUser.mockResolvedValue(mockEmptyRatings);

      const result = await controller.getMyRatings(mockRequest);

      expect(result).toEqual(mockEmptyRatings);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getMovieRatings', () => {
    it('should return movie ratings', async () => {
      const mockMovieRatings = {
        data: [mockRating],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockRatingService.findByMovie.mockResolvedValue(mockMovieRatings);

      const result = await controller.getMovieRatings(1);

      expect(mockRatingService.findByMovie).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMovieRatings);
    });

    it('should handle movie with no ratings', async () => {
      const mockEmptyRatings = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };

      mockRatingService.findByMovie.mockResolvedValue(mockEmptyRatings);

      const result = await controller.getMovieRatings(999);

      expect(result).toEqual(mockEmptyRatings);
    });
  });

  describe('getAverageRating', () => {
    it('should return average rating for a movie', async () => {
      const mockAverageValue = 8.5;

      mockRatingService.getAverageRating.mockResolvedValue(mockAverageValue);

      const result = await controller.getAverageRating(1);

      expect(mockRatingService.getAverageRating).toHaveBeenCalledWith(1);
      expect(result).toEqual({ average: mockAverageValue });
      expect(result.average).toBe(8.5);
    });

    it('should handle movie with no ratings', async () => {
      const mockAverageValue = 0;

      mockRatingService.getAverageRating.mockResolvedValue(mockAverageValue);

      const result = await controller.getAverageRating(999);

      expect(result).toEqual({ average: mockAverageValue });
      expect(result.average).toBe(0);
    });

    it('should handle invalid movie ID', async () => {
      const error = new Error('Movie not found');
      mockRatingService.getAverageRating.mockRejectedValue(error);

      await expect(controller.getAverageRating(-1)).rejects.toThrow(error);
    });
  });

  describe('controller definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(typeof controller.create).toBe('function');
      expect(typeof controller.update).toBe('function');
      expect(typeof controller.delete).toBe('function');
      expect(typeof controller.getMyRatings).toBe('function');
      expect(typeof controller.getMovieRatings).toBe('function');
      expect(typeof controller.getAverageRating).toBe('function');
    });
  });

  describe('validation', () => {
    it('should validate rating DTO', async () => {
      const invalidDto = {
        movieId: 'invalid',
        rating: 8.5,
      };

      const error = new Error('Validation failed');
      mockRatingService.create.mockRejectedValue(error);

      await expect(
        controller.create(invalidDto as any, mockRequest),
      ).rejects.toThrow(error);
    });

    it('should validate required fields', async () => {
      const incompleteDto = {
        review: 'Great movie!',
      } as CreateRatingDto;

      const error = new Error('movieId and rating are required');
      mockRatingService.create.mockRejectedValue(error);

      await expect(
        controller.create(incompleteDto, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const createRatingDto: CreateRatingDto = {
        movieId: 1,
        rating: 8.5,
      };

      const serviceError = new Error('Database connection failed');
      mockRatingService.create.mockRejectedValue(serviceError);

      await expect(
        controller.create(createRatingDto, mockRequest),
      ).rejects.toThrow(serviceError);
    });

    it('should handle network errors', async () => {
      const error = new Error('Network timeout');
      mockRatingService.getAverageRating.mockRejectedValue(error);

      await expect(controller.getAverageRating(1)).rejects.toThrow(error);
    });
  });
});
