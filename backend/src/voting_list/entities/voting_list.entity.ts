import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class VotingList {
  @PrimaryColumn({ type: 'bigint' })
  voting_id: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'int', nullable: true })
  voting_amt: number;
}
