//  User types
export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  avatar: string;
  isAdmin?: boolean;
  gamesPlayed?: number;
  gamesWon?: number;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

// Card game types
export interface Card {
  id: string;
  suit: string;
  rank: string;
  value: number;
  isHidden?: boolean;
}

export interface Player {
  id: string;
  username: string;
  isAI: boolean;
  hand: Card[];
  isDropped: boolean;
  canDrop: boolean;
  score: number;
  penalties: number;
  avatar: string;
}

export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  status: 'waiting' | 'playing' | 'ended';
  stake: number;
  pot: number;
  winner: string | null;
  winningMultiplier?: number;
  createdAt?: number;
  lastActionAt?: number;
}

export type GameAction = 'draw' | 'discard' | 'drop';

export interface GameContextType {
  game: GameState | null;
  isLoading: boolean;
  createGame: (userId: string, stake: number) => Promise<GameState>;
  joinGame: (userId: string, gameId: string) => Promise<GameState>;
  fetchGame: (gameId: string) => Promise<GameState>;
  performAction: (
    gameId: string, 
    userId: string, 
    action: GameAction, 
    cardId?: string
  ) => Promise<GameState>;
}

// Table types
export interface TableStake {
  id: string;
  amount: number;
  maxPlayers: number;
  currentPlayers: number;
}

// Withdrawal types
export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  cashAppTag: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  timestamp: number;
  processedAt?: number;
}
 