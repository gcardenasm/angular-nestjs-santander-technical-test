import { DataSource } from 'typeorm';
import { CandidateEntity } from './src/candidate/entities/candidate.entity';
import 'dotenv/config';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [CandidateEntity],
  migrations: ['src/migrations/*.ts'],
});
