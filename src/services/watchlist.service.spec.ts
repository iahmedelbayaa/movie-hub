import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WatchlistService } from './watchlist.service';
import {
  UserWatchlist,
  WatchlistType,
} from '../entities/user-watchlist.entity';
import { Movie } from '../entities/movie.entity';
import { CreateWatchlistDto } from '../dtos/watchlist.dto';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

describe('WatchlistService', () => {
  let service: WatchlistService;

  const mockMovie = { id: 1, title: 'Test Movie' };
  const mockWatchlistItem = {
    id: 1,
    type: WatchlistType.WATCHLIST,
    user: { id: 1 },
    movie: mockMovie,
    createdAt: new Date(),
  };

  const mockWatchlistRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMovieRepository = {
    findOne: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: getRepositoryToken(UserWatchlist),
          useValue: mockWatchlistRepository,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
    mockWatchlistRepository.createQueryBuilder.mockReturnValue(
      mockQueryBuilder,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToWatchlist', () => {
    it('should add movie to watchlist successfully', async () => {
      const createWatchlistDto: CreateWatchlistDto = {
        movieId: 1,
        type: WatchlistType.WATCHLIST,
      };

      mockMovieRepository.findOne.mockResolvedValue(mockMovie);
      mockWatchlistRepository.findOne.mockResolvedValue(null);
      mockWatchlistRepository.create.mockReturnValue(mockWatchlistItem);
      mockWatchlistRepository.save.mockResolvedValue(mockWatchlistItem);

      const result = await service.addToWatchlist(1, createWatchlistDto);

      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockWatchlistRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 }, movie: { id: 1 } },
      });
      expect(result).toEqual(mockWatchlistItem);
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      const createWatchlistDto: CreateWatchlistDto = {
        movieId: 999,
        type: WatchlistType.WATCHLIST,
      };

      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addToWatchlist(1, createWatchlistDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if movie already in watchlist', async () => {
      const createWatchlistDto: CreateWatchlistDto = {
        movieId: 1,
        type: WatchlistType.WATCHLIST,
      };

      mockMovieRepository.findOne.mockResolvedValue(mockMovie);
      mockWatchlistRepository.findOne.mockResolvedValue(mockWatchlistItem);

      await expect(
        service.addToWatchlist(1, createWatchlistDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('removeFromWatchlist', () => {
    it('should remove item from watchlist successfully', async () => {
      mockWatchlistRepository.findOne.mockResolvedValue(mockWatchlistItem);
      mockWatchlistRepository.remove.mockResolvedValue(undefined);

      await service.removeFromWatchlist(1, 1);

      expect(mockWatchlistRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(mockWatchlistRepository.remove).toHaveBeenCalledWith(
        mockWatchlistItem,
      );
    });

    it('should throw NotFoundException if watchlist item does not exist', async () => {
      mockWatchlistRepository.findOne.mockResolvedValue(null);

      await expect(service.removeFromWatchlist(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user tries to remove another user's item", async () => {
      const otherUserItem = { ...mockWatchlistItem, user: { id: 2 } };
      mockWatchlistRepository.findOne.mockResolvedValue(otherUserItem);

      await expect(service.removeFromWatchlist(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getUserWatchlist', () => {
    it('should return user watchlist', async () => {
      const mockWatchlist = [mockWatchlistItem];
      mockQueryBuilder.getMany.mockResolvedValue(mockWatchlist);

      const result = await service.getUserWatchlist(1);

      expect(mockWatchlistRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(mockWatchlist);
    });

    it('should filter by type when provided', async () => {
      const mockWatchlist = [mockWatchlistItem];
      mockQueryBuilder.getMany.mockResolvedValue(mockWatchlist);

      await service.getUserWatchlist(1, WatchlistType.FAVORITE);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'watchlist.type = :type',
        { type: WatchlistType.FAVORITE },
      );
    });
  });

  describe('getWatchlistStats', () => {
    it('should return watchlist statistics', async () => {
      mockWatchlistRepository.count
        .mockResolvedValueOnce(5) // total watchlist
        .mockResolvedValueOnce(3); // total favorites

      const result = await service.getWatchlistStats(1);

      expect(result).toEqual({
        totalWatchlist: 5,
        totalFavorites: 3,
      });
    });
  });
});
