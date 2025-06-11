import  { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WithdrawalForm from '../components/WithdrawalForm';
import { fetchWithdrawalHistory } from '../api/gameApi';
import { WithdrawalRequest } from '../types';
import { Clock } from 'lucide-react';

export default function WithdrawalPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    const loadWithdrawals = async () => {
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
    
    loadWithdrawals();
  }, [user]);
  
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
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 font-display">Withdrawals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <WithdrawalForm />
        </div>
        
        <div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Withdrawal History</h2>
            
            {!user ? (
              <div className="text-center text-gray-400 py-8">
                Please sign in to view your withdrawal history.
              </div>
            ) : isLoading ? (
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
          </div>
        </div>
      </div>
    </div>
  );
}
 