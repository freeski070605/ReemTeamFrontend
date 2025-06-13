import  { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Loader2, Check } from 'lucide-react';

export default function DepositForm() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cashapp');
  const [cashAppTag, setCashAppTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  
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
    
    if (paymentMethod === 'cashapp' && !cashAppTag) {
      setError('Please enter your CashApp tag');
      return;
    }
    
    if (paymentMethod === 'cashapp' && !cashAppTag.startsWith('$')) {
      setError('CashApp tag must start with $ symbol');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulated deposit processing
      // In a real app, this would make an API call to process payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setStep(2);
    } catch (error) {
      console.error('Deposit error:', error);
      setError((error as Error).message || 'Failed to process deposit');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStepOne = () => (
    <form onSubmit={handleSubmit}>
      {user && (
        <div className="mb-6 bg-gray-700/50 rounded-lg p-3">
          <div className="text-sm text-gray-400">Current Balance</div>
          <div className="text-2xl font-semibold">${user.balance || 0}</div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-300">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Payment Method</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
              paymentMethod === 'cashapp'
                ? 'border-primary-500 bg-primary-900/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
            onClick={() => setPaymentMethod('cashapp')}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full ${
                  paymentMethod === 'cashapp'
                    ? 'bg-primary-500'
                    : 'border border-gray-500'
                }`}></div>
              </div>
              <div className="font-medium">CashApp</div>
            </div>
          </div>
          
          <div
            className="border border-gray-700 rounded-lg p-3 cursor-not-allowed text-gray-500"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border border-gray-600"></div>
              </div>
              <div className="font-medium">Credit Card</div>
            </div>
            <div className="text-xs ml-8 mt-1">Coming soon</div>
          </div>
          
          <div
            className="border border-gray-700 rounded-lg p-3 cursor-not-allowed text-gray-500"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border border-gray-600"></div>
              </div>
              <div className="font-medium">Crypto</div>
            </div>
            <div className="text-xs ml-8 mt-1">Coming soon</div>
          </div>
        </div>
      </div>
      
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
            >
              ${quickAmount}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="amount" className="block text-gray-300 mb-2">
          Amount to Deposit
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
            required
          />
        </div>
      </div>
      
      {paymentMethod === 'cashapp' && (
        <div className="mb-6">
          <label htmlFor="cashAppTag" className="block text-gray-300 mb-2">
            Your CashApp Tag
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
          <p className="text-xs text-gray-400 mt-1">
            We'll use this to verify your payment
          </p>
        </div>
      )}
      
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading || !amount || (paymentMethod === 'cashapp' && !cashAppTag)}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Processing...
          </span>
        ) : (
          'Submit Deposit Request'
        )}
      </button>
      
      <div className="mt-4 text-sm text-gray-400 text-center">
        Deposits are processed within 10 minutes after payment confirmation
      </div>
      
      <div className="mt-6 bg-gray-700/30 rounded-lg p-4">
        <div className="flex items-start">
          <CreditCard className="w-5 h-5 text-primary-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-300">How to deposit with CashApp</h4>
            <ol className="list-decimal ml-5 mt-2 text-sm text-gray-400 space-y-1">
              <li>Submit this form with your deposit amount and CashApp tag</li>
              <li>Send payment to <span className="text-primary-400 font-medium">$ReemTeamTonk</span> using CashApp</li>
              <li>Include your username ({user?.username}) in the payment notes</li>
              <li>Your balance will be updated within 10 minutes</li>
            </ol>
          </div>
        </div>
      </div>
    </form>
  );
  
  const renderStepTwo = () => (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="h-8 w-8 text-green-400" />
      </div>
      
      <h3 className="font-semibold text-green-400 text-xl mb-2">Deposit Request Submitted!</h3>
      
      <div className="bg-gray-700/30 rounded-lg p-4 mb-6 text-left">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="text-gray-400">Amount:</div>
          <div className="text-white font-medium">${amount}</div>
          
          <div className="text-gray-400">Payment Method:</div>
          <div className="text-white font-medium">CashApp</div>
          
          <div className="text-gray-400">CashApp Tag:</div>
          <div className="text-white font-medium">{cashAppTag}</div>
          
          <div className="text-gray-400">Status:</div>
          <div className="text-yellow-400 font-medium">Awaiting Payment</div>
        </div>
        
        <div className="border-t border-gray-600 pt-4 text-gray-300">
          <p className="mb-2">
            Please send ${amount} to our CashApp at <span className="font-semibold text-primary-400">$ReemTeamTonk</span> with your username in the notes.
          </p>
          <p className="text-sm text-gray-400">
            Your balance will be updated within 10 minutes after payment is confirmed.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSuccess(false);
            setAmount(0);
            setCashAppTag('');
            setStep(1);
          }}
        >
          Make Another Deposit
        </button>
        
        <button 
          className="btn bg-gray-700 hover:bg-gray-600 text-white"
          onClick={() => window.location.href = '/lobby'}
        >
          Go to Game Lobby
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1525018667593-176858caed6a?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxkYXJrJTIwYmx1ZSUyMGNhc2lubyUyMGdhbWluZyUyMHByb2ZpbGUlMjBpbnRlcmZhY2V8ZW58MHx8fHwxNzQ5ODIzNzYzfDA&ixlib=rb-4.1.0&fit=fillmax&h=500&w=800')" }}></div>
        <div className="relative flex items-center gap-4 p-4">
          <div className="text-3xl text-white font-bold font-display">Add Funds</div>
        </div>
      </div>
      
      {step === 1 ? renderStepOne() : renderStepTwo()}
    </div>
  );
}
 