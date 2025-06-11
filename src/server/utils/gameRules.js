/**
  * Game Rules for Server
 */

// Check for special payout conditions
function checkSpecialPayouts(player, isFirstTurn = false) {
  const handValue = player.hand.reduce((sum, card) => sum + card.value, 0);
  
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

// Apply a penalty to a player for hitting a spread
function applyPenalty(player) {
  // First hit: 2-turn penalty
  if (player.penalties === 0) {
    player.penalties = 2;
  } else {
    // Additional hits: +1 turn penalty each
    player.penalties += 1;
  }
  
  player.canDrop = false;
  
  return player;
}

// Update penalties at the end of a turn
function updatePenalties(players) {
  return players.map(player => {
    if (player.penalties > 0) {
      player.penalties -= 1;
      
      // Reset canDrop if penalties are over
      if (player.penalties === 0) {
        player.canDrop = true;
      }
    }
    return player;
  });
}

// Check if a move would hit a spread
function wouldHitSpread(card, player) {
  // Check if player has more than 2 cards of same rank
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

module.exports = {
  checkSpecialPayouts,
  applyPenalty,
  updatePenalties,
  wouldHitSpread
};
 