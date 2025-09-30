import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from '../services/watchlist.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateWatchlistDto } from '../dtos/watchlist.dto';
import { WatchlistType } from '../entities/user-watchlist.entity';

describe('WatchlistController', () => {
  let controller: WatchlistController;

  const mockWatchlistService = {
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn(),
    getUserWatchlist: jest.fn(),
    getWatchlistStats: jest.fn(),
    isMovieInWatchlist: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockWatchlistItem = {
    id: 1,
    userId: 1,
    movieId: 1,
    type: WatchlistType.WATCHLIST,
    createdAt: new Date(),
  };

  const mockRequest = {
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        {
          provide: WatchlistService,
          useValue: mockWatchlistService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WatchlistController>(WatchlistController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToWatchlist', () => {
    it('should add movie to watchlist', async () => {
      const createWatchlistDto: CreateWatchlistDto = {
        movieId: 1,
        type: WatchlistType.WATCHLIST,
      };

      const expectedResponse = {
        message: 'Movie added to watchlist successfully',
        watchlistItem: mockWatchlistItem,
      };

      mockWatchlistService.addToWatchlist.mockResolvedValue(expectedResponse);

      const result = await controller.addToWatchlist(
        createWatchlistDto,
        mockRequest,
      );

      expect(mockWatchlistService.addToWatchlist).toHaveBeenCalledWith(
        mockUser.id,
        createWatchlistDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should add movie to favorites', async () => {
      const createWatchlistDto: CreateWatchlistDto = {
        movieId: 1,
        type: WatchlistType.FAVORITE,
      };

      const favoriteItem = {
        ...mockWatchlistItem,
        type: WatchlistType.FAVORITE,
      };

      const expectedResponse = {
        message: 'Movie added to favorites successfully',
        watchlistItem: favoriteItem,
      };

      mockWatchlistService.addToWatchlist.mockResolvedValue(expectedResponse);

      const result = await controller.addToWatchlist(
        createWatchlistDto,
        mockRequest,
      );

      expect(mockWatchlistService.addToWatchlist).toHaveBeenCalledWith(
        mockUser.id,
        createWatchlistDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle duplicate watchlist entry', async () => {
      const createWatchlistDto: CreateWatchlistDto = {
        movieId: 1,
        type: WatchlistType.WATCHLIST,
      };

      const error = new Error('Movie already in watchlist');
      mockWatchlistService.addToWatchlist.mockRejectedValue(error);

      await expect(
        controller.addToWatchlist(createWatchlistDto, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('removeFromWatchlist', () => {
    it('should remove movie from watchlist', async () => {
      const expectedResponse = {
        message: 'Movie removed from watchlist successfully',
      };

      mockWatchlistService.removeFromWatchlist.mockResolvedValue(undefined);

      const result = await controller.removeFromWatchlist(1, mockRequest);

      expect(mockWatchlistService.removeFromWatchlist).toHaveBeenCalledWith(
        mockUser.id,
        1,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle watchlist item not found', async () => {
      const error = new Error('Watchlist item not found');
      mockWatchlistService.removeFromWatchlist.mockRejectedValue(error);

      await expect(
        controller.removeFromWatchlist(999, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('getWatchlist', () => {
    it('should return user watchlist', async () => {
      const mockWatchlist = [mockWatchlistItem];

      mockWatchlistService.getUserWatchlist.mockResolvedValue(mockWatchlist);

      const result = await controller.getWatchlist(mockRequest);

      expect(mockWatchlistService.getUserWatchlist).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
      );
      expect(result).toEqual(mockWatchlist);
    });

    it('should return user favorites', async () => {
      const mockFavorites = [
        { ...mockWatchlistItem, type: WatchlistType.FAVORITE },
      ];

      mockWatchlistService.getUserWatchlist.mockResolvedValue(mockFavorites);

      const result = await controller.getWatchlist(
        mockRequest,
        WatchlistType.FAVORITE,
      );

      expect(mockWatchlistService.getUserWatchlist).toHaveBeenCalledWith(
        mockUser.id,
        WatchlistType.FAVORITE,
      );
      expect(result).toEqual(mockFavorites);
    });

    it('should handle empty watchlist', async () => {
      mockWatchlistService.getUserWatchlist.mockResolvedValue([]);

      const result = await controller.getWatchlist(mockRequest);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getWatchlistStats', () => {
    it('should return watchlist statistics', async () => {
      const mockStats = {
        totalWatchlist: 5,
        totalFavorites: 3,
        totalItems: 8,
        recentlyAdded: 2,
      };

      mockWatchlistService.getWatchlistStats.mockResolvedValue(mockStats);

      const result = await controller.getWatchlistStats(mockRequest);

      expect(mockWatchlistService.getWatchlistStats).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(mockStats);
    });

    it('should handle user with no watchlist items', async () => {
      const mockEmptyStats = {
        totalWatchlist: 0,
        totalFavorites: 0,
        totalItems: 0,
        recentlyAdded: 0,
      };

      mockWatchlistService.getWatchlistStats.mockResolvedValue(mockEmptyStats);

      const result = await controller.getWatchlistStats(mockRequest);

      expect(result).toEqual(mockEmptyStats);
    });
  });

  describe('checkMovieInWatchlist', () => {
    it('should check if movie is in watchlist', async () => {
      const isInWatchlist = true;

      mockWatchlistService.isMovieInWatchlist.mockResolvedValue(isInWatchlist);

      const result = await controller.checkMovieInWatchlist(1, mockRequest);

      expect(mockWatchlistService.isMovieInWatchlist).toHaveBeenCalledWith(
        mockUser.id,
        1,
        undefined,
      );
      expect(result).toEqual({ isInWatchlist });
    });

    it('should check if movie is in favorites', async () => {
      const isInWatchlist = true;

      mockWatchlistService.isMovieInWatchlist.mockResolvedValue(isInWatchlist);

      const result = await controller.checkMovieInWatchlist(
        1,
        mockRequest,
        WatchlistType.FAVORITE,
      );

      expect(mockWatchlistService.isMovieInWatchlist).toHaveBeenCalledWith(
        mockUser.id,
        1,
        WatchlistType.FAVORITE,
      );
      expect(result).toEqual({ isInWatchlist });
    });

    it('should handle movie not in any list', async () => {
      const isInWatchlist = false;

      mockWatchlistService.isMovieInWatchlist.mockResolvedValue(isInWatchlist);

      const result = await controller.checkMovieInWatchlist(999, mockRequest);

      expect(result).toEqual({ isInWatchlist: false });
    });
  });

  describe('controller definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(typeof controller.addToWatchlist).toBe('function');
      expect(typeof controller.removeFromWatchlist).toBe('function');
      expect(typeof controller.getWatchlist).toBe('function');
      expect(typeof controller.getWatchlistStats).toBe('function');
      expect(typeof controller.checkMovieInWatchlist).toBe('function');
    });
  });

  describe('validation', () => {
    it('should validate watchlist type', async () => {
      const invalidDto = {
        movieId: 1,
        type: 'INVALID_TYPE',
      };

      const error = new Error('Invalid watchlist type');
      mockWatchlistService.addToWatchlist.mockRejectedValue(error);

      await expect(
        controller.addToWatchlist(invalidDto as any, mockRequest),
      ).rejects.toThrow(error);
    });

    it('should validate required fields', async () => {
      const incompleteDto = {
        movieId: 1,
      } as CreateWatchlistDto;

      const error = new Error('Type is required');
      mockWatchlistService.addToWatchlist.mockRejectedValue(error);

      await expect(
        controller.addToWatchlist(incompleteDto, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const createWatchlistDto: CreateWatchlistDto = {
        movieId: 1,
        type: WatchlistType.WATCHLIST,
      };

      const serviceError = new Error('Database connection failed');
      mockWatchlistService.addToWatchlist.mockRejectedValue(serviceError);

      await expect(
        controller.addToWatchlist(createWatchlistDto, mockRequest),
      ).rejects.toThrow(serviceError);
    });

    it('should handle network timeouts', async () => {
      const error = new Error('Request timeout');
      mockWatchlistService.getUserWatchlist.mockRejectedValue(error);

      await expect(controller.getWatchlist(mockRequest)).rejects.toThrow(error);
    });
  });
});
