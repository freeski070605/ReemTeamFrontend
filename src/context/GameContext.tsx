import  { createContext, useState, useContext, ReactNode } from 'react';
import { GameState, GameContextType, GameAction } from '../types';
import { 
  createGame as apiCreateGame,
  joinGame as apiJoinGame,
  fetchGameState as apiFetchGameState,
  performGameAction as apiPerformGameAction
} from '../api/gameApi';

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createGame = async (userId: string, stake: number) => {
    setIsLoading(true);
    try {
      const newGame = await apiCreateGame(userId, stake);
      setGame(newGame);
      return newGame;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = async (userId: string, gameId: string) => {
    setIsLoading(true);
    try {
      const joinedGame = await apiJoinGame(userId, gameId);
      setGame(joinedGame);
      return joinedGame;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGame = async (gameId: string) => {
    setIsLoading(true);
    try {
      const fetchedGame = await apiFetchGameState(gameId);
      setGame(fetchedGame);
      return fetchedGame;
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const performAction = async (
    gameId: string, 
    userId: string, 
    action: GameAction, 
    cardId?: string
  ) => {
    setIsLoading(true);
    try {
      const updatedGame = await apiPerformGameAction(gameId, userId, action, cardId);
      setGame(updatedGame);
      return updatedGame;
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GameContext.Provider value={{ 
      game, 
      isLoading,
      createGame,
      joinGame,
      fetchGame,
      performAction
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
 