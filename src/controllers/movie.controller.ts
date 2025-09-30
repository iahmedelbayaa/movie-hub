import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { MovieService } from '../services/movie.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetMoviesDto, MovieResponseDto } from '../dtos/movie.dto';

@ApiTags('movies')
@Controller('movies')
@UseInterceptors(CacheInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all movies with pagination, search, and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'List of movies retrieved successfully',
    type: [MovieResponseDto],
  })
  @CacheTTL(300000) // Cache for 5 minutes
  async findAll(@Query() query: GetMoviesDto) {
    return await this.movieService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get movie by ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie retrieved successfully',
    type: MovieResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @CacheTTL(600000) // Cache for 10 minutes
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.movieService.findOne(id);
  }
}
