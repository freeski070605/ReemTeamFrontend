import  { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import GameBoard from '../components/GameBoard';
import { ArrowLeft } from 'lucide-react';
import { useGameWebSocket } from '../hooks/useWebSocket';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const { game, createGame, joinGame, fetchGame, isLoading } = useGame();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { lastMessage, isConnected } = useGameWebSocket(gameId || null);

  // Initialize or join game
  useEffect(() => {
    if (!user || !gameId) return;
    
    const initializeGame = async () => {
      try {
        setError(null);
        
        // Case 1: Join existing game
        if (gameId && !gameId.includes('table-')) {
          await joinGame(user.id, gameId);
          return;
        }
        
        // Case 2: Create new game from table
        if (gameId && gameId.includes('table-')) {
          // Extract stake amount from table ID
          const tableIdParts = gameId.split('-');
          const tableIndex = parseInt(tableIdParts[1], 10);
          
          // Map table index to stake amount
          const stakeAmounts = [1, 1, 5, 5, 10, 20, 50];
          const stakeAmount = stakeAmounts[tableIndex - 1] || 1;
          
          const newGame = await createGame(user.id, stakeAmount);
          
          // Update URL to new game ID
          if (newGame) {
            navigate(`/game/${newGame.id}`, { replace: true });
          }
          return;
        }
      } catch (error) {
        console.error('Error initializing game:', error);
        setError((error as Error).message || 'Failed to initialize game');
      }
    };
    
    initializeGame();
  }, [gameId, user]);

  // Handle real-time updates from websocket
  useEffect(() => {
    if (lastMessage && gameId) {
      if (lastMessage.type === 'gameUpdate' && lastMessage.gameId === gameId) {
        // Refresh game state
        fetchGame(gameId);
      }
    }
  }, [lastMessage, gameId]);

  // Periodically refresh game state (fallback for websocket)
  useEffect(() => {
    if (!gameId || !user || isConnected) return;
    
    // Poll for updates every 5 seconds if websocket is not connected
    const pollInterval = setInterval(() => {
      fetchGame(gameId);
    }, 5000);
    
    return () => clearInterval(pollInterval);
  }, [gameId, user, isConnected]);

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Sign In Required</h1>
        <p className="text-xl text-gray-400 mb-8">
          You need to sign in to play real money games.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/login" className="btn btn-outline">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-red-300 mb-4">Error</h2>
          <p className="text-white mb-6">{error}</p>
          <Link to="/lobby" className="btn btn-primary">
            Return to Lobby
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-semibold">Setting up your game...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link to="/lobby" className="flex items-center text-gray-400 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Lobby
        </Link>
        
        <div className="text-right">
          <h1 className="text-2xl font-bold font-display">
            {game && `$${game.stake} Tonk Table`}
          </h1>
          {game && (
            <div className="text-sm text-gray-400">Game ID: {game.id}</div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <GameBoard />
      </div>
      
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Game Rules Reminder</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Special Payouts</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Deal 50: Double payout</li>
              <li>• 41 on first turn: Triple payout</li>
              <li>• 11 and under: Triple payout</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Penalties</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• First hit: 2 turn drop penalty</li>
              <li>• Additional hits: +1 turn penalty each</li>
              <li>• Applies to own and opponent spreads</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Game Deck</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• 40-card deck (standard deck minus 8s, 9s, and 10s)</li>
              <li>• Face cards worth 10 points</li>
              <li>• Aces worth 1 point</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
 