import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateVotingElementDto {
  @IsNotEmpty()
  @Transform(({ value }) => String(value))
  voting_id: string;

  @IsNotEmpty()
  @IsString()
  item: string;
}