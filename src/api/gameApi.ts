import  { User, GameState, GameAction, TableStake, WithdrawalRequest } from '../types';

const API_BASE_URL = 'https://reemteamserver.onrender.com';

// Helper function to get auth headers
function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'x-auth-token': token || ''
  };
}

// Auth API functions
export async function login(username: string, password: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function register(username: string, email: string, password: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function updateProfile(userId: string, profileData: Partial<User>): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Profile update failed');
    }
    
    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

// Game API functions
export async function createGame(userId: string, stake: number): Promise<GameState> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ stake })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create game');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Create game error:', error);
    throw error;
  }
}

export async function joinGame(userId: string, gameId: string): Promise<GameState> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games/${gameId}/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to join game');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Join game error:', error);
    throw error;
  }
}

export async function fetchGameState(gameId: string): Promise<GameState> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games/${gameId}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch game');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch game error:', error);
    throw error;
  }
}

export async function performGameAction(
  gameId: string, 
  userId: string, 
  action: GameAction, 
  cardId?: string
): Promise<GameState> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/games/${gameId}/action`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, cardId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to perform ${action}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Game action error (${action}):`, error);
    throw error;
  }
}

// Table API functions
export async function fetchTables(): Promise<TableStake[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tables`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch tables');
    }
    
    const tables = await response.json();
    
    // Map the response to match our frontend TableStake interface
    return tables.map((table: any) => ({
      id: table.tableId,
      amount: table.amount,
      maxPlayers: table.maxPlayers,
      currentPlayers: table.currentPlayers
    }));
  } catch (error) {
    console.error('Fetch tables error:', error);
    throw error;
  }
}

export async function fetchPlayerCount(): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tables/player-count`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch player count');
    }
    
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Fetch player count error:', error);
    throw error;
  }
}

// Withdrawal API functions
export async function submitWithdrawal(
  userId: string, 
  amount: number, 
  cashAppTag: string
): Promise<WithdrawalRequest> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/withdrawals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, cashAppTag })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit withdrawal');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Submit withdrawal error:', error);
    throw error;
  }
}

export async function fetchWithdrawalHistory(userId: string): Promise<WithdrawalRequest[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/withdrawals`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch withdrawal history');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch withdrawal history error:', error);
    throw error;
  }
}
 
