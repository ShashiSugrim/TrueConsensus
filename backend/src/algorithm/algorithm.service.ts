import { Injectable } from '@nestjs/common';
import { CurrentVotesService } from '../current_votes/current_votes.service';
import { CurrentVote } from 'src/current_votes/entities/current_vote.entity';

@Injectable()
export class AlgorithmService {
  constructor(
    private readonly currentVotesService: CurrentVotesService
  ) {}

  async calculateConsensus(votingId: number): Promise<string> {
    console.log("consensus algo has been run! for this votingId: ", votingId);
    // Get all votes for the specified voting ID
    let votes = await this.currentVotesService.findByVotingId(votingId);
    console.log("algorithm.service.ts: actual votes from DB: ", votes.length);
    
    // // Add test data if we have few or no votes (for development/testing)
    // if (!votes || votes.length < 3) {
    //   console.log("Using test data because we have few or no actual votes");
      
    //   // Sample test data with different rankings

    //   // Combine real votes with test votes
    //   votes = [...(votes || []), ...testVotes as unknown as CurrentVote[]];
    //   console.log("algorithm.service.ts: combined with test votes: ", votes);
    // }
    
    if (!votes || votes.length === 0) {
      return "";
    }

    // Extract all unique candidates from rankings
    const allCandidates = new Set<string>();
    votes.forEach(vote => {
      if (vote.ranking) {
        vote.ranking.split(',').forEach(candidate => {
          allCandidates.add(candidate);
        });
      }
    });

    // Convert to array and sort for consistent order
    const candidates = Array.from(allCandidates).sort();
    
    // If no candidates found, return empty string
    if (candidates.length === 0) {
      return "";
    }
    
    // Run the Condorcet algorithm
    const finalRanking = this.runCondorcet(candidates, votes);
    
    // Convert the final ranking back to a string like "2,3,1"
    return finalRanking.join(',');
  }

  private runCondorcet(candidates: string[], votes: CurrentVote[]): string[] {
    if (candidates.length < 2) {
      return candidates; // If only one candidate, return it
    }
    if (candidates.length > 10) {
      console.warn('Large number of candidates detected:', candidates.length);
    }
  
    // Build pairwise preference matrix
    // [i][j] represents how many voters prefer candidate i over j
    const pairwise = Array.from({ length: candidates.length }, () =>
      Array(candidates.length).fill(0)
    );
  
    votes.forEach(vote => {
      if (!vote.ranking || !vote.ranking.trim()) return;
      
      const ranking = vote.ranking.split(',');
      
      // For each pair of candidates, count preferences
      for (let i = 0; i < ranking.length; i++) {
        const candidateI = ranking[i];
        const indexI = candidates.indexOf(candidateI);
        
        if (indexI === -1) continue; // Skip if candidate not found
        
        // For all candidates after candidateI in the ranking (less preferred)
        for (let j = i + 1; j < ranking.length; j++) {
          const candidateJ = ranking[j];
          const indexJ = candidates.indexOf(candidateJ);
          
          if (indexJ === -1) continue;
          
          // Voter prefers candidateI (at position i) over candidateJ (at position j)
          pairwise[indexI][indexJ]++;
        }
      }
    });
  
    // Build edges with margin of victory
    interface Edge {
      winner: number;
      loser: number;
      margin: number;
    }
    
    const edges: Edge[] = [];
    for (let i = 0; i < candidates.length; i++) {
      for (let j = 0; j < candidates.length; j++) {
        if (i !== j && pairwise[i][j] > pairwise[j][i]) {
          edges.push({
            winner: i,
            loser: j,
            margin: pairwise[i][j] - pairwise[j][i],
          });
        }
      }
    }
  
    // Sort edges by margin (descending)
    edges.sort((a, b) => b.margin - a.margin);
  
    // Lock edges (Ranked Pairs)
    const locked = Array.from({ length: candidates.length }, () =>
      Array(candidates.length).fill(false)
    );
  
    const createsCycle = (winner: number, loser: number): boolean => {
      if (winner === loser) return true;
      for (let k = 0; k < candidates.length; k++) {
        if (locked[loser][k] && createsCycle(winner, k)) {
          return true;
        }
      }
      return false;
    };
  
    edges.forEach(edge => {
      if (!createsCycle(edge.winner, edge.loser)) {
        locked[edge.winner][edge.loser] = true;
      }
    });
  
    // Count outbound edges (not inbound) to determine rank
    // More outbound edges means higher ranking
    const rankingScores = candidates.map((_, idx) => {
      let outboundEdges = 0;
      for (let j = 0; j < candidates.length; j++) {
        if (locked[idx][j]) outboundEdges++;
      }
      return { candidate: idx, score: outboundEdges };
    });
  
    // Sort by outbound edges (descending)
    rankingScores.sort((a, b) => b.score - a.score);
    
    // Return the final ranking
    let top10 = rankingScores.map(r => candidates[r.candidate]).slice(0, 10);
    return top10;
  }
}
