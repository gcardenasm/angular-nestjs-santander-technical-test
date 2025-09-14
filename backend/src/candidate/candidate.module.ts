import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './candidate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateEntity } from './entities/candidate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateEntity])],
  controllers: [CandidateController],
  providers: [CandidateService],
})
export class CandidateModule {}
