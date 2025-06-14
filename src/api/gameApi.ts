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

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.error('Invalid JSON from login endpoint:', text);
      throw new Error('Unexpected server response (not JSON)');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

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

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.error('Invalid JSON from register endpoint:', text);
      throw new Error('Unexpected server response (not JSON)');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

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

export async function joinGame(gameId: string): Promise<GameState> {
  if (!gameId || gameId === 'undefined') {
    throw new Error('Invalid game ID');
  }

  const response = await fetch(`${API_BASE_URL}/api/games/${gameId}/join`, {
    method: 'POST',
    headers: getHeaders() // Auth token included
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error('Invalid JSON from joinGame:', text);
    throw new Error('Unexpected server response');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Failed to join game');
  }

  return data;
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
      currentPlayers: table.currentPlayers,
      gameId: table.activeGames?.[0]?._id || null // ✅ game ID to join

    }));
  } catch (error) {
    console.error('Fetch tables error:', error);
    throw error;
  }
}

export async function fetchPlayerCount() {
  const res = await fetch(`${API_BASE_URL}/api/tables/player-count`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch player count');
  }

  const data = await res.json();
  return data.count;
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
 
