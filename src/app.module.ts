import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserWatchlist } from './entities/user-watchlist.entity';
import { Rating } from './entities/rating.entity';
import { User } from './entities/user.entity';
import { Genre } from './entities/genre.entity';
import { Movie } from './entities/movie.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [Movie, Genre, User, Rating, UserWatchlist],
        synchronize: configService.get('nodeEnv') === 'development',
        logging: configService.get('nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Repository modules
    TypeOrmModule.forFeature([Movie, Genre, User, Rating, UserWatchlist]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
