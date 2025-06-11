import  { GameState, Player, Card } from '../types';
import { calculateHandValue } from './cards';

/**
 * Checks for special payout conditions
 * Returns multiplier (1 = normal, 2 = double, 3 = triple)
 */
export function checkSpecialPayouts(player: Player, isFirstTurn: boolean = false): number {
  const handValue = calculateHandValue(player.hand);
  
  // Deal 50: Double payout
  if (handValue === 50) {
    return 2;
  }
  
  // 41 on first turn: Triple payout
  if (isFirstTurn && handValue === 41) {
    return 3;
  }
  
  // 11 and under: Triple payout
  if (handValue <= 11) {
    return 3;
  }
  
  return 1; // Normal payout
}

/**
 * Applies a penalty to a player for hitting a spread
 */
export function applyPenalty(player: Player): Player {
  const updatedPlayer = { ...player };
  
  // First hit: 2-turn penalty
  if (updatedPlayer.penalties === 0) {
    updatedPlayer.penalties = 2;
  } else {
    // Additional hits: +1 turn penalty each
    updatedPlayer.penalties += 1;
  }
  
  updatedPlayer.canDrop = false;
  
  return updatedPlayer;
}

/**
 * Updates penalties at the end of a turn
 */
export function updatePenalties(players: Player[]): Player[] {
  return players.map(player => {
    if (player.penalties > 0) {
      const updatedPlayer = { ...player };
      updatedPlayer.penalties -= 1;
      
      // Reset canDrop if penalties are over
      if (updatedPlayer.penalties === 0) {
        updatedPlayer.canDrop = true;
      }
      
      return updatedPlayer;
    }
    return player;
  });
}

/**
 * Determines the winner and calculates final pot distribution
 */
export function determineWinner(game: GameState): { 
  winner: Player, 
  payout: number, 
  multiplier: number 
} {
  // Find player with lowest score
  const lowestScore = Math.min(...game.players.map(player => player.score));
  const winner = game.players.find(player => player.score === lowestScore)!;
  
  // Check for special payouts
  const multiplier = checkSpecialPayouts(winner);
  
  // Calculate payout
  const payout = game.pot * multiplier;
  
  return { winner, payout, multiplier };
}

/**
 * Check if a move would hit a spread
 */
export function wouldHitSpread(card: Card, player: Player): boolean {
  // This would need more complex logic in a real implementation
  // to check if adding this card would hit an existing spread
  
  // Simplified check: if player has more than 2 cards of same rank or sequential in same suit
  const sameRankCount = player.hand.filter(c => c.rank === card.rank).length;
  if (sameRankCount >= 2) return true;
  
  // Check for sequential cards of same suit
  const sameSuitCards = player.hand.filter(c => c.suit === card.suit);
  if (sameSuitCards.length >= 2) {
    // Sort by value
    const values = sameSuitCards.map(c => c.value).sort((a, b) => a - b);
    
    // Check if adding this card would complete a sequence
    for (let i = 0; i < values.length - 1; i++) {
      if (
        (values[i] === card.value - 1 && values[i+1] === card.value + 1) ||
        (values[i] === card.value - 2 && values[i+1] === card.value - 1) ||
        (values[i] === card.value + 1 && values[i+1] === card.value + 2)
      ) {
        return true;
      }
    }
  }
  
  return false;
}
 