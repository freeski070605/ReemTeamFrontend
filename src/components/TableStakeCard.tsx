import  { TableStake } from '../types';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TableStakeCardProps {
  table: TableStake;
}

export default function TableStakeCard({ table }: TableStakeCardProps) {
  const getStakeColorClass = (amount: number): string => {
    switch (amount) {
      case 1: return 'bg-green-700 border-green-500';
      case 5: return 'bg-blue-700 border-blue-500';
      case 10: return 'bg-yellow-700 border-yellow-500';
      case 20: return 'bg-red-700 border-red-500';
      case 50: return 'bg-purple-700 border-purple-500';
      default: return 'bg-gray-700 border-gray-500';
    }
  };

  return (
    <div className="card bg-gray-800 border border-gray-700 hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/20">
      <div className="p-4 flex flex-col items-center">
        <div className={`table-stake ${getStakeColorClass(table.amount)} border-2 mb-3`}>
          ${table.amount}
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          ${table.amount} Table
        </h3>
        
        <div className="flex items-center text-gray-400 mb-4">
          <Users className="h-4 w-4 mr-2" />
          <span>{table.currentPlayers}/{table.maxPlayers} Players</span>
        </div>
        
        <Link 
          to={`/game/${table.id}`}
          className="w-full btn btn-primary"
        >
          Join Table
        </Link>
      </div>
    </div>
  );
}
 