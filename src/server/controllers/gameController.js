/**
  * Game Controller
 * 
 * Handles game creation, joining, and gameplay actions
 */

const Game = require('../models/Game');
const User = require('../models/User');
const { createDeck, shuffleDeck } = require('../utils/cards');
const { makeAIMove, chooseAIDiscard } = require('../utils/ai');
const { checkSpecialPayouts, applyPenalty, updatePenalties } = require('../utils/gameRules');

// Create a new game
exports.createGame = async (req, res) => {
  try {
    const { userId, stake } = req.body;
    
    // Validate stake
    if (![1, 5, 10, 20, 50].includes(stake)) {
      return res.status(400).json({ error: 'Invalid stake amount' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has enough balance
    if (user.balance < stake) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Deduct stake from user balance
    user.balance -= stake;
    await user.save();
    
    // Create a new deck
    const deck = createDeck();
    
    // Create AI players
    const aiPlayers = [];
    for (let i = 0; i < 3; i++) {
      aiPlayers.push({
        id: `ai-${i + 1}`,
        username: `AI Player ${i + 1}`,
        avatar: `https://avatars.dicebear.com/api/bottts/ai${i + 1}.svg`,
        hand: [],
        score: 0,
        isDropped: false,
        canDrop: true,
        penalties: 0,
        isAI: true
      });
    }
    
    // Create human player
    const humanPlayer = {
      id: userId,
      username: user.username,
      avatar: user.avatar,
      hand: [],
      score: 0,
      isDropped: false,
      canDrop: true,
      penalties: 0,
      isAI: false
    };
    
    // Deal 5 cards to each player
    const players = [humanPlayer, ...aiPlayers];
    
    for (const player of players) {
      player.hand = deck.splice(0, 5);
      
      // Show only the human player's cards
      if (!player.isAI) {
        player.hand.forEach(card => { card.isHidden = false; });
      }
    }
    
    // Create new game
    const newGame = new Game({
      players,
      deck,
      discardPile: [{ ...deck.pop(), isHidden: false }], // Start discard pile with one card
      status: 'playing',
      stake,
      pot: stake * players.length
    });
    
    await newGame.save();
    
    res.status(201).json(newGame);
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Server error creating game' });
  }
};

// Join an existing game
exports.joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req.body;
    
    // Find game
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if game is waiting for players
    if (game.status !== 'waiting') {
      return res.status(400).json({ error: 'Game already in progress or ended' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has enough balance
    if (user.balance < game.stake) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Check if user is already in the game
    if (game.players.some(player => player.id === userId)) {
      return res.status(400).json({ error: 'User already in game' });
    }
    
    // Check if game is full
    if (game.players.length >= 4) {
      return res.status(400).json({ error: 'Game is full' });
    }
    
    // Deduct stake from user balance
    user.balance -= game.stake;
    await user.save();
    
    // Add user to game
    const newPlayer = {
      id: userId,
      username: user.username,
      avatar: user.avatar,
      hand: [],
      score: 0,
      isDropped: false,
      canDrop: true,
      penalties: 0,
      isAI: false
    };
    
    // Deal 5 cards to the new player
    newPlayer.hand = game.deck.splice(0, 5);
    newPlayer.hand.forEach(card => { card.isHidden = false; });
    
    game.players.push(newPlayer);
    game.pot += game.stake;
    
    // If game has 4 players, start the game
    if (game.players.length === 4) {
      game.status = 'playing';
    }
    
    await game.save();
    
    res.json(game);
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ error: 'Server error joining game' });
  }
};

// Get game state
exports.getGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Hide AI player cards
    const gameWithHiddenCards = game.toObject();
    gameWithHiddenCards.players.forEach(player => {
      if (player.isAI) {
        player.hand.forEach(card => {
          card.isHidden = true;
          card.rank = '?';
          card.suit = '?';
          card.value = 0;
        });
      }
    });
    
    res.json(gameWithHiddenCards);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Server error getting game' });
  }
};

// Perform game action (draw, discard, drop)
exports.performAction = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId, action, cardId } = req.body;
    
    // Find game
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if game is active
    if (game.status !== 'playing') {
      return res.status(400).json({ error: 'Game not in progress' });
    }
    
    // Find player index
    const playerIndex = game.players.findIndex(player => player.id === userId);
    if (playerIndex === -1) {
      return res.status(404).json({ error: 'Player not in game' });
    }
    
    // Check if it's the player's turn
    if (game.currentPlayerIndex !== playerIndex) {
      return res.status(400).json({ error: 'Not your turn' });
    }
    
    let nextPlayerIndex = (playerIndex + 1) % game.players.length;
    
    // Process action
    switch (action) {
      case 'draw':
        // Draw card from deck or discard pile
        if (game.deck.length === 0) {
          // Reshuffle discard pile if deck is empty (leaving top card)
          const topCard = game.discardPile.shift();
          game.deck = shuffleDeck(game.discardPile);
          game.discardPile = [topCard];
        }
        
        const drawnCard = cardId === 'discard' 
          ? game.discardPile.shift() 
          : game.deck.pop();
        
        if (!drawnCard) {
          return res.status(400).json({ error: 'No cards to draw' });
        }
        
        // Add card to player's hand
        drawnCard.isHidden = false;
        game.players[playerIndex].hand.push(drawnCard);
        
        // Update last action time
        game.lastActionAt = Date.now();
        await game.save();
        
        res.json(game);
        break;
        
      case 'discard':
        if (!cardId) {
          return res.status(400).json({ error: 'No card specified for discard' });
        }
        
        // Find card in player's hand
        const cardIndex = game.players[playerIndex].hand.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
          return res.status(404).json({ error: 'Card not in hand' });
        }
        
        // Remove card from hand and add to discard pile
        const discardedCard = game.players[playerIndex].hand.splice(cardIndex, 1)[0];
        discardedCard.isHidden = false;
        game.discardPile.unshift(discardedCard);
        
        // Move to next player
        game.currentPlayerIndex = nextPlayerIndex;
        
        // Update penalties
        game.players = updatePenalties(game.players);
        
        // Update last action time
        game.lastActionAt = Date.now();
        await game.save();
        
        // Process AI turns if next player is AI
        await processAITurns(game);
        
        res.json(game);
        break;
        
      case 'drop':
        // Check if player can drop
        if (!game.players[playerIndex].canDrop) {
          return res.status(400).json({ error: 'Cannot drop due to penalties' });
        }
        
        // Mark player as dropped
        game.players[playerIndex].isDropped = true;
        
        // Calculate score
        const playerScore = game.players[playerIndex].hand.reduce((sum, card) => sum + card.value, 0);
        game.players[playerIndex].score = playerScore;
        
        // Check if all players are dropped
        const allDropped = game.players.every(player => player.isDropped);
        
        if (allDropped) {
          // End game
          game.status = 'ended';
          
          // Determine winner
          const lowestScore = Math.min(...game.players.map(p => p.score));
          const winnerIndex = game.players.findIndex(p => p.score === lowestScore);
          
          // Check for special payouts
          const multiplier = checkSpecialPayouts(game.players[winnerIndex]);
          game.winningMultiplier = multiplier;
          
          // Set winner
          game.winner = game.players[winnerIndex].id;
          
          // If human player wins, add winnings to balance
          if (!game.players[winnerIndex].isAI) {
            const winner = await User.findById(game.players[winnerIndex].id);
            if (winner) {
              winner.balance += game.pot * multiplier;
              await winner.save();
            }
          }
        } else {
          // Move to next player if current player is dropped
          while (game.players[nextPlayerIndex].isDropped) {
            nextPlayerIndex = (nextPlayerIndex + 1) % game.players.length;
          }
          game.currentPlayerIndex = nextPlayerIndex;
          
          // Update penalties
          game.players = updatePenalties(game.players);
        }
        
        // Update last action time
        game.lastActionAt = Date.now();
        await game.save();
        
        // Process AI turns if next player is AI and game still active
        if (game.status === 'playing') {
          await processAITurns(game);
        }
        
        res.json(game);
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Perform action error:', error);
    res.status(500).json({ error: 'Server error performing action' });
  }
};

// Process AI turns
async function processAITurns(game) {
  let currentPlayerIndex = game.currentPlayerIndex;
  
  // Process AI turns until it's a human player's turn or game ends
  while (game.status === 'playing' && game.players[currentPlayerIndex].isAI) {
    // Get AI player
    const aiPlayer = game.players[currentPlayerIndex];
    
    // Skip if AI player is dropped
    if (aiPlayer.isDropped) {
      currentPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
      game.currentPlayerIndex = currentPlayerIndex;
      continue;
    }
    
    // Make AI decision
    const aiDecision = makeAIMove(game, currentPlayerIndex);
    
    // Process AI action
    if (aiDecision.action === 'draw') {
      // AI draws card (preferring discard pile if it would improve hand)
      const topDiscardCard = game.discardPile[0];
      
      if (game.deck.length === 0) {
        // Reshuffle discard pile if deck is empty (leaving top card)
        const topCard = game.discardPile.shift();
        game.deck = shuffleDeck(game.discardPile);
        game.discardPile = [topCard];
      }
      
      // Decide whether to draw from deck or discard pile
      const drawnCard = topDiscardCard && aiDecision.source === 'discard'
        ? game.discardPile.shift()
        : game.deck.pop();
      
      if (drawnCard) {
        aiPlayer.hand.push(drawnCard);
      }
      
      // AI discard decision
      const cardToDiscard = chooseAIDiscard(aiPlayer.hand);
      const discardIndex = aiPlayer.hand.findIndex(card => card.id === cardToDiscard);
      
      if (discardIndex !== -1) {
        const discardedCard = aiPlayer.hand.splice(discardIndex, 1)[0];
        discardedCard.isHidden = false;
        game.discardPile.unshift(discardedCard);
      }
      
      // Move to next player
      currentPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
      game.currentPlayerIndex = currentPlayerIndex;
      
      // Update penalties
      game.players = updatePenalties(game.players);
    } else if (aiDecision.action === 'drop') {
      // AI drops
      aiPlayer.isDropped = true;
      
      // Calculate score
      const aiScore = aiPlayer.hand.reduce((sum, card) => sum + card.value, 0);
      aiPlayer.score = aiScore;
      
      // Check if all players are dropped
      const allDropped = game.players.every(player => player.isDropped);
      
      if (allDropped) {
        // End game
        game.status = 'ended';
        
        // Determine winner
        const lowestScore = Math.min(...game.players.map(p => p.score));
        const winnerIndex = game.players.findIndex(p => p.score === lowestScore);
        
        // Check for special payouts
        const multiplier = checkSpecialPayouts(game.players[winnerIndex]);
        game.winningMultiplier = multiplier;
        
        // Set winner
        game.winner = game.players[winnerIndex].id;
        
        // If human player wins, add winnings to balance
        if (!game.players[winnerIndex].isAI) {
          const winner = await User.findById(game.players[winnerIndex].id);
          if (winner) {
            winner.balance += game.pot * multiplier;
            await winner.save();
          }
        }
      } else {
        // Move to next player
        while (game.players[currentPlayerIndex].isDropped) {
          currentPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
        }
        game.currentPlayerIndex = currentPlayerIndex;
        
        // Update penalties
        game.players = updatePenalties(game.players);
      }
    }
    
    // Update last action time
    game.lastActionAt = Date.now();
  }
  
  // Save game after all AI actions
  await game.save();
  
  return game;
}
 