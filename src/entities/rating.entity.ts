import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Movie } from './movie.entity';

@Entity('ratings')
@Unique(['user', 'movie'])
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  review: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;
}
