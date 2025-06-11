import  { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitWithdrawal } from '../api/gameApi';

export default function WithdrawalForm() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [cashAppTag, setCashAppTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Quick amounts
  const quickAmounts = [10, 20, 50, 100];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate inputs
    if (amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amount > (user.balance || 0)) {
      setError('Withdrawal amount exceeds your balance');
      return;
    }
    
    if (!cashAppTag) {
      setError('Please enter your CashApp tag');
      return;
    }
    
    if (!cashAppTag.startsWith('$')) {
      setError('CashApp tag must start with $ symbol');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await submitWithdrawal(user.id, amount, cashAppTag);
      setSuccess(true);
      setAmount(0);
      setCashAppTag('');
    } catch (error) {
      console.error('Withdrawal error:', error);
      setError((error as Error).message || 'Failed to process withdrawal');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Cash Out to CashApp</h2>
      
      {success ? (
        <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-green-400 mb-2">Withdrawal Request Submitted!</h3>
          <p className="text-gray-300">
            Your withdrawal request has been submitted. You will receive your funds via CashApp within 1 hour.
          </p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => setSuccess(false)}
          >
            Make Another Withdrawal
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {user && (
            <div className="mb-4 bg-gray-700/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">Available Balance</div>
              <div className="text-2xl font-semibold">${user.balance || 0}</div>
            </div>
          )}
          
          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-300">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Quick Amount</label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  className={`py-2 rounded-md transition-colors ${
                    amount === quickAmount 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setAmount(quickAmount)}
                  disabled={quickAmount > (user?.balance || 0)}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-300 mb-2">
              Amount to Withdraw
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">$</span>
              <input
                type="number"
                id="amount"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="bg-gray-700 w-full py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max={user?.balance || 0}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="cashAppTag" className="block text-gray-300 mb-2">
              CashApp Tag
            </label>
            <input
              type="text"
              id="cashAppTag"
              value={cashAppTag}
              onChange={(e) => setCashAppTag(e.target.value)}
              placeholder="$YourCashAppTag"
              className="bg-gray-700 w-full py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading || !amount || !cashAppTag || amount > (user?.balance || 0)}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Submit Withdrawal Request'
            )}
          </button>
          
          <div className="mt-4 text-sm text-gray-400 text-center">
            Withdrawals are processed within 1 hour via CashApp
          </div>
        </form>
      )}
    </div>
  );
}
 