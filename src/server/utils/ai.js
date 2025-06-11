/**
  * AI Logic for Server
 */

const { isValidSpread } = require('./cards');

// Simple AI decision making for computer players
function makeAIMove(game, playerIndex) {
  const player = game.players[playerIndex];
  
  // If can drop and hand value is good, drop
  if (player.canDrop && shouldAIDrop(player.hand)) {
    return { action: 'drop' };
  }
  
  // If there's a card in discard pile that would improve hand, draw it
  const topDiscardCard = game.discardPile[0];
  if (topDiscardCard && wouldImproveHand(player.hand, topDiscardCard)) {
    return { action: 'draw', source: 'discard' };
  }
  
  // Otherwise draw from deck
  return { action: 'draw', source: 'deck' };
}

// Decides which card the AI should discard
function chooseAIDiscard(hand) {
  // Find highest value card that doesn't contribute to a potential spread
  const sortedByValue = [...hand].sort((a, b) => b.value - a.value);
  
  // Check each card starting with highest value
  for (const card of sortedByValue) {
    // Skip if card is part of a potential spread
    if (!isPartOfPotentialSpread(card, hand)) {
      return card.id;
    }
  }
  
  // If all cards are part of potential spreads, discard highest value
  return sortedByValue[0].id;
}

// Determines if AI should drop based on hand quality
function shouldAIDrop(hand) {
  const handValue = hand.reduce((sum, card) => sum + card.value, 0);
  
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

// Checks if a card from discard pile would improve the hand
function wouldImproveHand(hand, discardCard) {
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

// Checks if a card is part of a potential spread
function isPartOfPotentialSpread(card, hand) {
  const otherCards = hand.filter(c => c.id !== card.id);
  
  // Check for same rank (potential set)
  const sameRank = otherCards.filter(c => c.rank === card.rank);
  if (sameRank.length >= 1) {
    return true;
  }
  
  // Check for sequential cards of same suit (potential run)
  const sameSuit = otherCards.filter(c => c.suit === card.suit);
  if (sameSuit.length >= 1) {
    for (const otherCard of sameSuit) {
      if (Math.abs(otherCard.value - card.value) <= 2) {
        return true;
      }
    }
  }
  
  return false;
}

module.exports = {
  makeAIMove,
  chooseAIDiscard
};
 