import { IsNotEmpty } from 'class-validator';

export class CandidateDto {
  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  surname!: string;
}