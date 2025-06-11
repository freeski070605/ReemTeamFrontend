import  { Player, Card, GameState } from '../types';
import { calculateHandValue, isValidSpread } from './cards';

/**
 * Simple AI decision making for computer players
 */
export function makeAIMove(gameState: GameState, playerIndex: number): { action: 'draw' | 'discard' | 'drop', cardId?: string } {
  const player = gameState.players[playerIndex];
  
  // If can drop and hand value is good, drop
  if (player.canDrop && shouldAIDrop(player.hand)) {
    return { action: 'drop' };
  }
  
  // If there's a card in discard pile that would improve hand, draw it
  const topDiscardCard = gameState.discardPile[0];
  if (wouldImproveHand(player.hand, topDiscardCard)) {
    return { action: 'draw' };
  }
  
  // Otherwise draw from deck
  return { action: 'draw' };
}

/**
 * Decides which card the AI should discard
 */
export function chooseAIDiscard(hand: Card[]): string {
  // Find highest value card that doesn't contribute to a potential spread
  const sortedByValue = [...hand].sort((a, b) => b.value - a.value);
  
  // Simple strategy: discard highest value card
  return sortedByValue[0].id;
}

/**
 * Determines if AI should drop based on hand quality
 */
function shouldAIDrop(hand: Card[]): boolean {
  const handValue = calculateHandValue(hand);
  
  // Drop if hand value is low enough
  if (handValue <= 15) {
    return true;
  }
  
  // Check if hand has any spreads
  for (let i = 0; i < hand.length - 2; i++) {
    for (let j = i + 1; j < hand.length - 1; j++) {
      for (let k = j + 1; k < hand.length; k++) {
        if (isValidSpread([hand[i], hand[j], hand[k]])) {
          // Has a spread, more likely to drop
          return handValue <= 25;
        }
      }
    }
  }
  
  return false;
}

/**
 * Checks if a card from discard pile would improve the hand
 */
function wouldImproveHand(hand: Card[], discardCard: Card): boolean {
  // Check if adding this card would create a spread
  for (let i = 0; i < hand.length - 1; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      if (isValidSpread([hand[i], hand[j], discardCard])) {
        return true;
      }
    }
  }
  
  // Check if it would lower the overall hand value
  const highestCard = [...hand].sort((a, b) => b.value - a.value)[0];
  return discardCard.value < highestCard.value;
}
 