import  { Card, CardRank, CardSuit } from '../types';

/**
 * Creates and returns a shuffled deck of cards for Tonk
 * Uses a 40-card deck (standard deck minus 8s, 9s, and 10s)
 */
export function createDeck(): Card[] {
  const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];
  const values: Record<CardRank, number> = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, 'J': 10, 'Q': 10, 'K': 10
  };
  
  const deck: Card[] = [];
  
  // Create the 40-card deck (standard deck minus 8s, 9s, and 10s)
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        id: `${rank}-${suit}`,
        rank,
        suit,
        value: values[rank],
        isHidden: true
      });
    }
  }
  
  return shuffleDeck(deck);
}

/**
 * Shuffles a deck of cards using the Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Calculates the total point value of a hand
 */
export function calculateHandValue(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + card.value, 0);
}

/**
 * Checks if a hand qualifies for special payouts
 * Returns the multiplier (1 = normal, 2 = double, 3 = triple)
 */
export function checkSpecialPayout(cards: Card[], isFirstTurn: boolean = false): number {
  const totalValue = calculateHandValue(cards);
  
  // Deal 50: Double payout
  if (totalValue === 50) {
    return 2;
  }
  
  // 41 on first turn: Triple payout
  if (isFirstTurn && totalValue === 41) {
    return 3;
  }
  
  // 11 and under: Triple payout
  if (totalValue <= 11) {
    return 3;
  }
  
  return 1; // Normal payout
}

/**
 * Checks if cards form a valid spread (set or run)
 */
export function isValidSpread(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  
  // Check if it's a set (same rank)
  const isSet = cards.every(card => card.rank === cards[0].rank);
  if (isSet) return true;
  
  // Check if it's a run (sequential cards of the same suit)
  const sameSuit = cards.every(card => card.suit === cards[0].suit);
  if (!sameSuit) return false;
  
  // Sort by value
  const sortedCards = [...cards].sort((a, b) => a.value - b.value);
  
  // Check if sequential
  for (let i = 1; i < sortedCards.length; i++) {
    if (sortedCards[i].value !== sortedCards[i-1].value + 1) {
      return false;
    }
  }
  
  return true;
}
 