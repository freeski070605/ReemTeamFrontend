import  { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, DollarSign, Home, Shield, Info, LogIn, CreditCard } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-gray-800/95 backdrop-blur-sm sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Shield className="h-8 w-8 text-primary-500" />
                <span className="ml-2 text-xl font-display font-bold text-white">Reem Team</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="border-transparent text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium hover:border-primary-400 hover:text-primary-400 transition-colors">
                Home
              </Link>
              <Link to="/lobby" className="border-transparent text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium hover:border-primary-400 hover:text-primary-400 transition-colors">
                Play Now
              </Link>
              <Link to="/rules" className="border-transparent text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium hover:border-primary-400 hover:text-primary-400 transition-colors">
                Rules
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center">
                <Link to="/profile" className="bg-gray-700 hover:bg-gray-600 p-1 rounded-full text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white mr-2">
                  <span className="sr-only">View profile</span>
                  <div className="flex items-center gap-1 px-2">
                    <div className="h-6 w-6 rounded-full overflow-hidden">
                      <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                    </div>
                    <span className="text-sm">${user.balance || 0}</span>
                  </div>
                </Link>

                <div className="flex gap-2">
                  <Link to="/profile" className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">View profile</span>
                    <User className="h-4 w-4" />
                  </Link>
                  
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  >
                    <span className="sr-only">Sign out</span>
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500">
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Home
              </div>
            </Link>
            <Link
              to="/lobby"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Play Now
              </div>
            </Link>
            <Link
              to="/rules"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Rules
              </div>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {user ? (
              <>
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                    <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.username}</div>
                    <div className="text-sm font-medium text-gray-400">${user.balance || 0}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Your Profile
                    </div>
                  </Link>
                  <Link
                    to="/profile?tab=deposit"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Deposit
                    </div>
                  </Link>
                  <Link
                    to="/profile?tab=withdraw"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Withdraw
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign out
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1 px-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <div className="flex items-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Login
                  </div>
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Register
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
 
