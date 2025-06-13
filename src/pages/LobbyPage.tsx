import  { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import TableStakeCard from '../components/TableStakeCard';
import { TableStake } from '../types';
import { RefreshCw, Users } from 'lucide-react';
import { fetchTables, fetchPlayerCount } from '../api/gameApi';
import { useLobbyWebSocket } from '../hooks/useWebSocket';

export default function LobbyPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<TableStake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlayerCount, setActivePlayerCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected, lastMessage } = useLobbyWebSocket();

  // Load tables and player count
  useEffect(() => {
    loadTablesAndPlayerCount();
  }, []);

  // Handle real-time updates from websocket
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'playerCount') {
        setActivePlayerCount(lastMessage.count);
      } else if (lastMessage.type === 'tableUpdate') {
        updateTable(lastMessage.table);
      }
    }
  }, [lastMessage]);

  // Load tables and player count
  const loadTablesAndPlayerCount = async () => {
    setIsLoading(true);
    try {
      // Load tables
      const tablesData = await fetchTables();
      setTables(tablesData);
      
      // Load player count
      const count = await fetchPlayerCount();
      setActivePlayerCount(count);
    } catch (error) {
      console.error('Error loading lobby data:', error);
      setError((error as Error).message || 'Error loading lobby data');

      // Fallback to mock data if API fails
      setTables([
        { id: 'table-1', amount: 1, maxPlayers: 4, currentPlayers: 3 },
        { id: 'table-2', amount: 1, maxPlayers: 4, currentPlayers: 2 },
        { id: 'table-3', amount: 5, maxPlayers: 4, currentPlayers: 4 },
        { id: 'table-4', amount: 5, maxPlayers: 4, currentPlayers: 1 },
        { id: 'table-5', amount: 10, maxPlayers: 4, currentPlayers: 3 },
        { id: 'table-6', amount: 20, maxPlayers: 4, currentPlayers: 2 },
        { id: 'table-7', amount: 50, maxPlayers: 4, currentPlayers: 1 },
      ]);
      setActivePlayerCount(Math.floor(Math.random() * 50) + 50);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a single table in state
  const updateTable = (updatedTable: TableStake) => {
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === updatedTable.id ? updatedTable : table
      )
    );
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTablesAndPlayerCount();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0 font-display">Game Lobby</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center bg-gray-800 rounded-lg px-4 py-2">
            <Users className="h-5 w-5 text-primary-400 mr-2" />
            <span className="text-gray-300">
              <span className="font-semibold text-white">{activePlayerCount}</span> players online
            </span>
            {!isConnected && (
              <span className="ml-2 text-yellow-500 text-xs">(offline)</span>
            )}
          </div>
          
          <button 
            onClick={handleRefresh}
            className="btn btn-outline flex items-center"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {!user && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-xl font-semibold mb-3">Sign In to Play</h2>
          <p className="text-gray-400 mb-4">
            You need an account to join real money games.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/login" className="btn btn-outline">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary">
              Create Account
            </Link>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg animate-pulse h-64"></div>
          ))
        ) : (
          tables.map(table => (
            <TableStakeCard key={table.id} table={table} />
          ))
        )}
      </div>
    </div>
  );
}
 
