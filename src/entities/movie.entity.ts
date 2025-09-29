import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Rating } from './rating.entity';
import { UserWatchlist } from './user-watchlist.entity';
import { Genre } from './genre.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tmdb_id', unique: true })
  tmdbId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ name: 'release_date', type: 'date', nullable: true })
  releaseDate?: Date;

  @Column({ name: 'poster_path', nullable: true })
  posterPath: string;

  @Column({ name: 'backdrop_path', nullable: true })
  backdropPath: string;

  @Column({
    name: 'vote_average',
    type: 'decimal',
    precision: 3,
    scale: 1,
    default: 0,
  })
  voteAverage: number;

  @Column({ name: 'vote_count', default: 0 })
  voteCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  popularity: number;

  @Column({ name: 'original_language', length: 5, nullable: true })
  originalLanguage: string;

  @Column({ name: 'original_title', nullable: true })
  originalTitle: string;

  @Column({ default: false })
  adult: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'runtime', nullable: true })
  runtime: number;

  @Column({ name: 'budget', type: 'bigint', default: 0 })
  budget: number;

  @Column({ name: 'revenue', type: 'bigint', default: 0 })
  revenue: number;

  @Column({ type: 'text', nullable: true })
  tagline: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Rating, (rating) => rating.movie)
  ratings: Rating[];

  @OneToMany(() => UserWatchlist, (watchlist) => watchlist.movie)
  watchlists: UserWatchlist[];

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable({
    name: 'movie_genres',
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: Genre[];

  // Virtual field for average rating
  averageRating?: number;
}
