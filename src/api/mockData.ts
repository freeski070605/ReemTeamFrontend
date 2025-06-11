import  { TableStake, GameState, Card, Player, WithdrawalRequest, User } from '../types';
import { createDeck } from '../utils/cards';

/**
 * Mock tables data for development
 */
export const mockTables: TableStake[] = [
  { id: 'table-1', amount: 1, maxPlayers: 4, currentPlayers: 3 },
  { id: 'table-2', amount: 1, maxPlayers: 4, currentPlayers: 2 },
  { id: 'table-3', amount: 5, maxPlayers: 4, currentPlayers: 4 },
  { id: 'table-4', amount: 5, maxPlayers: 4, currentPlayers: 1 },
  { id: 'table-5', amount: 10, maxPlayers: 4, currentPlayers: 3 },
  { id: 'table-6', amount: 20, maxPlayers: 4, currentPlayers: 2 },
  { id: 'table-7', amount: 50, maxPlayers: 4, currentPlayers: 1 },
];

/**
 * Creates a mock game state for development
 */
export function createMockGame(stake: number): GameState {
  // Create a new deck
  const deck = createDeck();
  
  // Create AI players
  const aiPlayers: Player[] = [];
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
  const humanPlayer: Player = {
    id: 'human-1',
    username: 'You',
    avatar: `https://avatars.dicebear.com/api/identicon/human.svg`,
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
  
  // Set up the game state
  return {
    id: `game-${Date.now()}`,
    players,
    currentPlayerIndex: 0, // Human player starts
    deck,
    discardPile: [{ ...deck.pop()!, isHidden: false }], // Start discard pile with one card
    status: 'playing',
    stake,
    pot: stake * players.length
  };
}

/**
 * Mock withdrawal history for development
 */
export const mockWithdrawals: WithdrawalRequest[] = [
  {
    userId: '1',
    amount: 25,
    cashAppTag: '$userTag1',
    status: 'approved',
    timestamp: Date.now() - 1000000
  },
  {
    userId: '1',
    amount: 50,
    cashAppTag: '$userTag1',
    status: 'pending',
    timestamp: Date.now() - 500000
  },
  {
    userId: '1',
    amount: 10,
    cashAppTag: '$userTag1',
    status: 'approved',
    timestamp: Date.now() - 2000000
  }
];

/**
 * Mock user for development
 */
export const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  balance: 100,
  avatar: 'https://avatars.dicebear.com/api/initials/test.svg'
};
 