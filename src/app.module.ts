import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserWatchlist } from './entities/user-watchlist.entity';
import { Rating } from './entities/rating.entity';
import { User } from './entities/user.entity';
import { Genre } from './entities/genre.entity';
import { Movie } from './entities/movie.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
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
