import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateVotingListDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => String(value))
  voting_id: string;

  @IsNotEmpty()
  @IsString()
  question: string;

  @IsOptional()
  @IsNumber()
  voting_amt?: number;
}
