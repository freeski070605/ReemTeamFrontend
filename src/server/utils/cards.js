/**
  * Card Utilities for Server
 */

// Create and return a shuffled deck of cards for Tonk
function createDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];
  const values = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, 'J': 10, 'Q': 10, 'K': 10
  };
  
  const deck = [];
  
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

// Shuffle a deck of cards using the Fisher-Yates algorithm
function shuffleDeck(deck) {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Calculate the total point value of a hand
function calculateHandValue(cards) {
  return cards.reduce((sum, card) => sum + card.value, 0);
}

// Check if cards form a valid spread (set or run)
function isValidSpread(cards) {
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

module.exports = {
  createDeck,
  shuffleDeck,
  calculateHandValue,
  isValidSpread
};
 