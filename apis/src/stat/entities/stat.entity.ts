import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Stat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  wins?: number;

  @Column()
  losses?: number;

  @Column()
  draws?: number;
}
