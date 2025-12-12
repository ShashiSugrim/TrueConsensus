import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateConsensusVoteDto {
  @IsNotEmpty()
  @Transform(({ value }) => String(value))
  votingId: string;

  @IsOptional()
  @IsString()
  calculatedConsensus?: string;

  @IsOptional()
  @IsString()
  formattedConsensus?: string;
}