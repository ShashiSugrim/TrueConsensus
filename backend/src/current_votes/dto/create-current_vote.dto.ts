import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCurrentVoteDto {
  @IsNotEmpty()
  @Transform(({ value }) => String(value))
  voting_id: string;

  @IsNotEmpty()
  @IsString()
  ranking: string;
}