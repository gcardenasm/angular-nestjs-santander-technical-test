import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateModule } from './candidate/candidate.module';
import { ConfigModule } from '@nestjs/config';
import { CandidateEntity } from './candidate/entities/candidate.entity';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [CandidateEntity],
        synchronize: false, 
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),
    CandidateModule,
  ],
})
export class AppModule {}
