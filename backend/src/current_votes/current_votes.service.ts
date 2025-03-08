import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCurrentVoteDto } from './dto/create-current_vote.dto';
import { UpdateCurrentVoteDto } from './dto/update-current_vote.dto';
import { CurrentVote } from './entities/current_vote.entity';
import { Console } from 'console';

@Injectable()
export class CurrentVotesService {
  constructor(
    @InjectRepository(CurrentVote)
    private currentVoteRepository: Repository<CurrentVote>,
  ) { }

  async create(createCurrentVoteDto: CreateCurrentVoteDto, user_id: string): Promise<CurrentVote> {
    // Validate ranking format
    if (createCurrentVoteDto.ranking) {
      this.validateRankingFormat(createCurrentVoteDto.ranking);
    } else {
      throw new BadRequestException('Ranking is required');
    }

    // Check if the user already voted on this specific voting list
    console.log("user wants to vote on voting list: ", createCurrentVoteDto.voting_id);
    const existingVote = await this.currentVoteRepository.findOne({
      where: {
        userId: user_id,
        votingId: createCurrentVoteDto.voting_id
      }
    });
    if (existingVote) {
      console.log("existing vote exists: ", existingVote);

      // Update the existing vote for this specific voting list
      this.currentVoteRepository.merge(existingVote, {
        ranking: createCurrentVoteDto.ranking
        // Add any other fields that should be updated here
      });
      return this.currentVoteRepository.save(existingVote);
    }

    // Create a new vote since one doesn't exist for this voting list
    const newVote = this.currentVoteRepository.create({
      votingId: createCurrentVoteDto.voting_id,
      ranking: createCurrentVoteDto.ranking,
      userId: user_id
      // Include any other necessary fields from createCurrentVoteDto
    });

    return this.currentVoteRepository.save(newVote);
  }

  /**
   * Validates that the ranking string is in the correct format:
   * - Only contains digits and commas
   * - No trailing comma
   * - All elements are numbers
   * - No duplicate numbers
   */
  private validateRankingFormat(ranking: string): void {
    // Check if the ranking is empty
    if (!ranking || ranking.trim() === '') {
      throw new BadRequestException('Ranking cannot be empty');
    }

    // Check for trailing comma
    if (ranking.endsWith(',')) {
      throw new BadRequestException('Ranking cannot have a trailing comma');
    }

    // Check format using regex (only numbers and commas allowed)
    const validFormatRegex = /^[0-9]+(,[0-9]+)*$/;
    if (!validFormatRegex.test(ranking)) {
      throw new BadRequestException('Ranking must be comma-separated numbers (e.g., "1,2,3,5,6")');
    }

    // Check for duplicate numbers in ranking
    const numbers = ranking.split(',').map(num => parseInt(num));
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      throw new BadRequestException('Ranking cannot contain duplicate numbers');
    }
  }

  async findAll(): Promise<CurrentVote[]> {
    return this.currentVoteRepository.find({
      relations: ['user', 'votingList']
    });
  }

  async findOne(id: number): Promise<CurrentVote> {
    const vote = await this.currentVoteRepository.findOne({
      where: { voteId: id },
      relations: ['user', 'votingList']
    });

    if (!vote) {
      throw new NotFoundException(`Current vote with ID ${id} not found`);
    }

    return vote;
  }

  async findByVotingId(votingId: number): Promise<CurrentVote[]> {
    return this.currentVoteRepository.find({
      where: { votingId }
    });
  }

  async findByUserId(userId: string): Promise<CurrentVote[]> {
    return this.currentVoteRepository.find({
      where: { userId },
      relations: ['votingList']
    });
  }

  async update(id: number, updateCurrentVoteDto: UpdateCurrentVoteDto): Promise<CurrentVote> {
    const vote = await this.findOne(id);

    // Update vote with new data
    this.currentVoteRepository.merge(vote, updateCurrentVoteDto);
    return this.currentVoteRepository.save(vote);
  }

  async remove(id: number): Promise<void> {
    const result = await this.currentVoteRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Current vote with ID ${id} not found`);
    }
  }
}