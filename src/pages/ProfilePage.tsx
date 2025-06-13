import  { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/gameApi';
import { fetchWithdrawalHistory } from '../api/gameApi';
import { WithdrawalRequest } from '../types';
import { Clock, User, DollarSign, CreditCard, Info, Award, LogOut } from 'lucide-react';
import WithdrawalForm from '../components/WithdrawalForm';
import DepositForm from '../components/DepositForm';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout, updateProfile: updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [email, setEmail] = useState('');
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for tab parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['overview', 'deposit', 'withdraw', 'history', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEmail(user.email);
    
    // Load withdrawal history when on that tab
    if (activeTab === 'history') {
      loadWithdrawalHistory();
    }
  }, [user, activeTab, navigate]);

  const loadWithdrawalHistory = async () => {
  if (!user) return;

  setIsLoading(true);
  try {
    const history = await fetchWithdrawalHistory(user.id);
    setWithdrawals(history);
  } catch (error) {
    console.error('Error loading withdrawal history:', error);
  } finally {
    setIsLoading(false);
  }
};


  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile({ email });
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError((error as Error).message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 overflow-hidden">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1743824521065-48d394eafcda?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxkYXJrJTIwYmx1ZSUyMGNhc2lubyUyMGdhbWluZyUyMHByb2ZpbGUlMjBpbnRlcmZhY2V8ZW58MHx8fHwxNzQ5ODIzNzYzfDA&ixlib=rb-4.1.0&fit=fillmax&h=500&w=800')" }}></div>
              <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 p-4">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-500 flex-shrink-0">
                  <img src={user?.avatar} alt={user?.username} className="w-full h-full object-cover" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold">{user?.username}</h2>
                  <p className="text-gray-400">{user?.email}</p>
                  <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3">
                    <div className="bg-gray-700/60 px-3 py-1 rounded-full text-sm flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      Games Won: {user?.gamesWon || 0}
                    </div>
                    <div className="bg-gray-700/60 px-3 py-1 rounded-full text-sm flex items-center">
                      <Info className="w-4 h-4 mr-1" />
                      Games Played: {user?.gamesPlayed || 0}
                    </div>
                  </div>
                </div>
                <div className="md:ml-auto bg-gray-900/60 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Current Balance</div>
                  <div className="text-2xl font-bold text-green-400">${user?.balance || 0}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700/40 rounded-lg p-5">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setActiveTab('deposit')}
                    className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors p-4 rounded-lg"
                  >
                    <CreditCard className="w-8 h-8 mb-2 text-primary-500" />
                    <span>Deposit</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('withdraw')}
                    className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors p-4 rounded-lg"
                  >
                    <DollarSign className="w-8 h-8 mb-2 text-green-500" />
                    <span>Withdraw</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors p-4 rounded-lg"
                  >
                    <User className="w-8 h-8 mb-2 text-blue-500" />
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors p-4 rounded-lg"
                  >
                    <Clock className="w-8 h-8 mb-2 text-yellow-500" />
                    <span>History</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-700/40 rounded-lg p-5">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">Game Stats</h3>
                <div className="space-y-4">
                  {user?.gamesPlayed ? (
                    <>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-primary-500 h-2.5 rounded-full" 
                            style={{ width: `${user?.gamesPlayed ? Math.round((user?.gamesWon || 0) / user?.gamesPlayed * 100) : 0}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-sm mt-1">
                          {user?.gamesPlayed ? Math.round((user?.gamesWon || 0) / user?.gamesPlayed * 100) : 0}%
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <div className="text-sm text-gray-400">Total Games</div>
                          <div className="text-xl font-bold">{user?.gamesPlayed || 0}</div>
                        </div>
                        <div className="bg-gray-800 p-3 rounded-lg">
                          <div className="text-sm text-gray-400">Victories</div>
                          <div className="text-xl font-bold text-primary-500">{user?.gamesWon || 0}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <p>No game statistics yet.</p>
                      <p className="mt-2">Play your first game to see your stats!</p>
                      <button 
                        onClick={() => navigate('/lobby')}
                        className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Go to Lobby
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
            
            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-300">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-900/30 border border-green-800 rounded-lg p-3 text-green-300">
                {success}
              </div>
            )}
            
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  id="username"
                  value={user?.username || ''}
                  className="bg-gray-700 w-full py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 opacity-50 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 w-full py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </form>
          </div>
        );
      
      case 'deposit':
        return <DepositForm />;
      
      case 'withdraw':
        return <WithdrawalForm />;
      
      case 'history':
        return (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
            
            <div className="flex mb-4 border-b border-gray-700">
              <button
                className={`py-2 px-4 ${activeHistoryTab === 'withdrawals' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400'}`}
                onClick={() => setActiveHistoryTab('withdrawals')}
              >
                Withdrawals
              </button>
              <button
                className={`py-2 px-4 ${activeHistoryTab === 'deposits' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400'}`}
                onClick={() => setActiveHistoryTab('deposits')}
              >
                Deposits
              </button>
              <button
                className={`py-2 px-4 ${activeHistoryTab === 'games' ? 'border-b-2 border-primary-500 text-primary-400' : 'text-gray-400'}`}
                onClick={() => setActiveHistoryTab('games')}
              >
                Game Results
              </button>
            </div>
            
            {renderHistoryTabContent()}
          </div>
        );
      
      default:
        return null;
    }
  };

  const [activeHistoryTab, setActiveHistoryTab] = useState('withdrawals');

  const renderHistoryTabContent = () => {
    switch (activeHistoryTab) {
      case 'withdrawals':
        return (
          <>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                <p>No withdrawal history found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-lg">${withdrawal.amount}</div>
                        <div className="text-sm text-gray-400">To: {withdrawal.cashAppTag}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(withdrawal.timestamp)}
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                    </div>
                    {withdrawal.adminNotes && (
                      <div className="mt-2 text-sm border-t border-gray-600 pt-2">
                        <span className="text-gray-400">Note:</span> {withdrawal.adminNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        );
      
      case 'deposits':
        return (
          <div className="text-center text-gray-400 py-8">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p>Deposit history will be available soon</p>
          </div>
        );
      
      case 'games':
        return (
          <div className="text-center text-gray-400 py-8">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p>Game history will be available soon</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl mb-4">Please log in to view your profile</h2>
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 font-display">My Profile</h1>
      
      <div className="flex flex-wrap mb-6 gap-2">
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'overview' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => {
            setActiveTab('overview');
            navigate('/profile');
          }}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'deposit' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => {
            setActiveTab('deposit');
            navigate('/profile?tab=deposit');
          }}
        >
          Deposit
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'withdraw' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => {
            setActiveTab('withdraw');
            navigate('/profile?tab=withdraw');
          }}
        >
          Withdraw
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'history' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => {
            setActiveTab('history');
            navigate('/profile?tab=history');
          }}
        >
          History
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'settings' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => {
            setActiveTab('settings');
            navigate('/profile?tab=settings');
          }}
        >
          Settings
        </button>
      </div>
      
      {renderTabContent()}
    </div>
  );
}
 
