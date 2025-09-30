import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TmdbGenresResponse,
  TmdbMovie,
  TmdbMovieDetails,
  TmdbResponse,
} from '../entities/movie.entity';

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY') || '';
    this.baseUrl =
      this.configService.get<string>('TMDB_BASE_URL') ||
      'https://api.themoviedb.org/3';

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      params: {
        api_key: this.apiKey,
      },
    });
  }

  async getPopularMovies(page: number = 1): Promise<TmdbResponse<TmdbMovie>> {
    try {
      const response = await this.httpClient.get('/movie/popular', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch popular movies from TMDB', error);
      throw error;
    }
  }

  async getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
    try {
      const response = await this.httpClient.get(`/movie/${tmdbId}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch movie details for TMDB ID ${tmdbId}`,
        error,
      );
      throw error;
    }
  }

  async getGenres(): Promise<TmdbGenresResponse> {
    try {
      const response = await this.httpClient.get('/genre/movie/list');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch genres from TMDB', error);
      throw error;
    }
  }

  async searchMovies(
    query: string,
    page: number = 1,
  ): Promise<TmdbResponse<TmdbMovie>> {
    try {
      const response = await this.httpClient.get('/search/movie', {
        params: { query, page },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to search movies with query: ${query}`, error);
      throw error;
    }
  }

  async getMoviesByGenre(
    genreId: number,
    page: number = 1,
  ): Promise<TmdbResponse<TmdbMovie>> {
    try {
      const response = await this.httpClient.get('/discover/movie', {
        params: { with_genres: genreId, page },
      });
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch movies for genre ID ${genreId}`,
        error,
      );
      throw error;
    }
  }

  async getTopRatedMovies(page: number = 1): Promise<TmdbResponse<TmdbMovie>> {
    try {
      const response = await this.httpClient.get('/movie/top_rated', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch top rated movies from TMDB', error);
      throw error;
    }
  }

  async getNowPlayingMovies(
    page: number = 1,
  ): Promise<TmdbResponse<TmdbMovie>> {
    try {
      const response = await this.httpClient.get('/movie/now_playing', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch now playing movies from TMDB', error);
      throw error;
    }
  }
}
