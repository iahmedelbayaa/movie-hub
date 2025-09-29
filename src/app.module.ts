import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { UserWatchlist } from './entities/user-watchlist.entity';
import { Rating } from './entities/rating.entity';
import { User } from './entities/user.entity';
import { Genre } from './entities/genre.entity';
import { Movie } from './entities/movie.entity';
import { AuthModule } from './modules/auth.module';
import { MovieModule } from './modules/movie.module';
import { RatingModule } from './modules/rating.module';
import { WatchlistModule } from './modules/watchlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        }),
        ttl: 300, // 5 minutes default TTL
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [Movie, Genre, User, Rating, UserWatchlist],
        synchronize: true, // Enable for development and Docker setup
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Repository modules
    TypeOrmModule.forFeature([Movie, Genre, User, Rating, UserWatchlist]),

    // Feature modules
    AuthModule,
    MovieModule,
    RatingModule,
    WatchlistModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
