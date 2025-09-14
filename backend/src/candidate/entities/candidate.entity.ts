import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

const isTest = process.env.NODE_ENV === 'test';

@Entity('candidates')
export class CandidateEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Index()
  @Column({ type: 'varchar', length: 120 })
  surname!: string;

  @Column({
    type: isTest ? 'simple-enum' : 'enum',
    enum: ['junior', 'senior'],
  })
  seniority!: 'junior' | 'senior';

  @Column({ type: 'int', unsigned: true })
  years!: number;

  @Column({ type: 'boolean', default: false })
  availability!: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
