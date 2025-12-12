import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CurrentVotesService } from './current_votes.service';
import { CreateCurrentVoteDto } from './dto/create-current_vote.dto';
import { UpdateCurrentVoteDto } from './dto/update-current_vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('current-votes')
export class CurrentVotesController {
  constructor(private readonly currentVotesService: CurrentVotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() createCurrentVoteDto: CreateCurrentVoteDto) {
    return this.currentVotesService.create(createCurrentVoteDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.currentVotesService.findAll();
  }

  @Get('userVoted/:votingId')
  @UseGuards(JwtAuthGuard)
  async userVoted(@Req() req, @Param('votingId') votingId: string) {
    return this.currentVotesService.checkUserVoteExists(votingId, req.user.userId);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.currentVotesService.findByVotingId(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCurrentVoteDto: UpdateCurrentVoteDto) {
    return this.currentVotesService.update(+id, updateCurrentVoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.currentVotesService.remove(+id);
  }
}
