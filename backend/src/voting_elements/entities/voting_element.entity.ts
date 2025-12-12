import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { VotingList } from '../../voting_list/entities/voting_list.entity';

@Entity('voting_elements')
export class VotingElement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  voting_id: string;

  @Column()
  item: string;

  @ManyToOne(() => VotingList, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'voting_id' })
  votingList: VotingList;
}
