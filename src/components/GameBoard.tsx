import  { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import PlayingCard from './PlayingCard';
import { GameAction } from '../types';

export default function GameBoard() {
  const { user } = useAuth();
  const { game, performAction } = useGame();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);
  
  // Reset game error when game state changes
  useEffect(() => {
    setGameError(null);
  }, [game]);
  
  if (!game || !user) {
    return <div className="text-center text-gray-400">No active game.</div>;
  }
  
  const gameId = game.id;
  const userId = user.id;
  const humanPlayer = game.players.find(player => player.id === userId);
  const isHumanTurn = game.currentPlayerIndex === game.players.findIndex(player => player.id === userId);
  const currentPlayer = game.players[game.currentPlayerIndex];
  
  const handleCardClick = (cardId: string) => {
    if (isHumanTurn) {
      setSelectedCardId(cardId === selectedCardId ? null : cardId);
    }
  };
  
  const executeAction = async (action: GameAction, cardId?: string) => {
    try {
      setGameError(null);
      await performAction(gameId, userId, action, cardId);
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      setGameError((error as Error).message || `Failed to ${action}`);
    }
  };
  
  const handleDraw = (source: 'deck' | 'discard') => {
    executeAction('draw', source === 'discard' ? 'discard' : undefined);
  };
  
  const handleDiscard = () => {
    if (selectedCardId) {
      executeAction('discard', selectedCardId);
      setSelectedCardId(null);
    }
  };
  
  const handleDrop = () => {
    executeAction('drop');
  };
  
  // Check if the human player exists
  if (!humanPlayer) {
    return (
      <div className="text-center text-red-400 p-4">
        Error: Your player information not found in the game.
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px]">
      <div className="game-table w-full h-full max-w-4xl relative">
        {/* Game info */}
        <div className="absolute top-4 left-4 bg-gray-900/80 rounded-lg p-2 text-sm">
          <div className="font-semibold">Pot: ${game.pot}</div>
          <div>Stake: ${game.stake}</div>
        </div>
        
        {/* AI Players */}
        <div className="w-full grid grid-cols-3 gap-4 mb-8">
          {game.players.filter(player => player.id !== userId).map((player, index) => (
            <div 
              key={player.id} 
              className={`flex flex-col items-center ${game.currentPlayerIndex === game.players.findIndex(p => p.id === player.id) ? 'opacity-100' : 'opacity-70'}`}
            >
              <div className="relative">
                <img 
                  src={player.avatar} 
                  alt={player.username} 
                  className="w-12 h-12 rounded-full border-2 border-gray-700"
                />
                {game.currentPlayerIndex === game.players.findIndex(p => p.id === player.id) && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="text-xs mt-1 font-medium">{player.username}</div>
              <div className="mt-2 flex justify-center space-x-[-30px]">
                {player.hand.map((card, cardIndex) => (
                  <PlayingCard 
                    key={`${player.id}-card-${cardIndex}`}
                    card={card}
                    className="w-10 transform rotate-3"
                  />
                ))}
              </div>
              {player.isDropped && (
                <div className="mt-1 text-xs font-medium bg-primary-900/70 px-2 py-0.5 rounded">
                  Dropped: {player.score}
                </div>
              )}
              {player.penalties > 0 && (
                <div className="mt-1 text-xs font-medium bg-red-900/70 px-2 py-0.5 rounded">
                  Penalty: {player.penalties} turn(s)
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Card piles */}
        <div className="flex justify-center space-x-8 mb-8">
          {/* Draw pile */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center relative h-24">
              {game.deck.length > 0 ? (
                <div className="relative">
                  <PlayingCard 
                    card={{ id: 'deck-top', rank: '?', suit: '?', value: 0, isHidden: true }}
                    className="w-16"
                  />
                  <div className="absolute -bottom-2 left-0 right-0 text-center text-xs text-white font-medium">
                    {game.deck.length} cards
                  </div>
                </div>
              ) : (
                <div className="w-16 h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-xs">Empty</span>
                </div>
              )}
            </div>
            <button 
              className="mt-2 btn btn-primary btn-sm"
              disabled={!isHumanTurn || game.deck.length === 0 || humanPlayer.isDropped}
              onClick={() => handleDraw('deck')}
            >
              Draw
            </button>
          </div>
          
          {/* Discard pile */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center relative h-24">
              {game.discardPile.length > 0 ? (
                <PlayingCard 
                  card={game.discardPile[0]}
                  className="w-16"
                />
              ) : (
                <div className="w-16 h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-xs">Empty</span>
                </div>
              )}
            </div>
            {isHumanTurn && game.discardPile.length > 0 ? (
              <button 
                className="mt-2 btn btn-secondary btn-sm"
                disabled={humanPlayer.isDropped}
                onClick={() => handleDraw('discard')}
              >
                Take
              </button>
            ) : (
              <button 
                className="mt-2 btn btn-secondary btn-sm"
                disabled={!isHumanTurn || !selectedCardId || humanPlayer.isDropped}
                onClick={handleDiscard}
              >
                Discard
              </button>
            )}
          </div>
        </div>
        
        {/* Human player */}
        <div className="w-full px-8">
          <div className="flex justify-center space-x-2 mb-3">
            <button 
              className="btn btn-primary btn-sm"
              disabled={!isHumanTurn || !humanPlayer.canDrop || humanPlayer.isDropped}
              onClick={handleDrop}
            >
              Drop Hand
            </button>
            
            <div className="text-center text-sm text-white/80 px-4 py-1 bg-gray-800/50 rounded-lg flex items-center">
              Your Score: {humanPlayer.hand.reduce((sum, card) => sum + card.value, 0)}
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className={`flex justify-center space-x-2 p-4 rounded-lg transition-colors ${isHumanTurn ? 'bg-primary-900/30 border border-primary-700' : 'bg-gray-800/30'}`}>
              {humanPlayer.hand.map((card) => (
                <PlayingCard 
                  key={card.id}
                  card={card}
                  className="w-16 md:w-20"
                  onClick={() => handleCardClick(card.id)}
                  selected={card.id === selectedCardId}
                />
              ))}
            </div>
          </div>
          
          {isHumanTurn ? (
            <div className="text-center mt-3 text-primary-400 font-medium">Your turn</div>
          ) : (
            <div className="text-center mt-3 text-gray-400">
              {currentPlayer ? currentPlayer.username : 'Unknown player'}'s turn
            </div>
          )}
          
          {gameError && (
            <div className="text-center mt-3 text-red-400 text-sm">
              {gameError}
            </div>
          )}
        </div>
        
        {/* Game over state */}
        {game.status === 'ended' && game.winner && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md text-center">
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              
              {/* Find the winning player */}
              {(() => {
                const winnerPlayer = game.players.find(p => p.id === game.winner);
                const winnerName = winnerPlayer ? 
                  (winnerPlayer.id === userId ? 'You' : winnerPlayer.username) : 
                  'Unknown player';
                
                const winnerScore = winnerPlayer ? winnerPlayer.score : 0;
                
                return (
                  <div>
                    <p className="text-xl mb-2">
                      {winnerName} won with a score of {winnerScore}!
                    </p>
                    {game.winningMultiplier && game.winningMultiplier > 1 && (
                      <p className="text-primary-400 mb-4">
                        Special payout: {game.winningMultiplier}x multiplier!
                      </p>
                    )}
                  </div>
                );
              })()}
              
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/lobby'}
              >
                Back to Lobby
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 