import  { Card } from '../types';

interface PlayingCardProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export default function PlayingCard({ card, onClick, selected, className = '' }: PlayingCardProps) {
  const suitSymbols: Record<string, string> = {
    'hearts': '♥',
    'diamonds': '♦',
    'clubs': '♣',
    'spades': '♠',
    '?': '?'
  };

  const suitColors: Record<string, string> = {
    'hearts': 'text-red-500',
    'diamonds': 'text-red-500',
    'clubs': 'text-white',
    'spades': 'text-white',
    '?': 'text-gray-400'
  };

  const isHidden = card.isHidden;
  const cardFaceClass = isHidden ? 'bg-primary-800' : 'bg-white';
  const selectClass = selected ? 'ring-4 ring-yellow-400 -translate-y-3' : '';
  const clickableClass = onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : '';

  return (
    <div 
      className={`playing-card rounded-lg relative transition-all ${cardFaceClass} ${selectClass} ${clickableClass} ${className}`} 
      onClick={onClick}
    >
      <div className={`aspect-[2/3] flex flex-col justify-between p-2 ${isHidden ? 'bg-primary-800' : 'bg-white'} rounded-lg shadow-md`}>
        {isHidden ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-2xl font-bold text-primary-400">RT</div>
          </div>
        ) : (
          <>
            <div className={`text-lg font-bold ${suitColors[card.suit]}`}>
              {card.rank}
            </div>
            <div className={`text-3xl font-bold self-center ${suitColors[card.suit]}`}>
              {suitSymbols[card.suit]}
            </div>
            <div className={`text-lg font-bold self-end rotate-180 ${suitColors[card.suit]}`}>
              {card.rank}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
 