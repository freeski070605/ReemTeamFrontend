import  { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogIn, Home, BookOpen, DollarSign, LogOut, LayoutList } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  
  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <svg className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.2" />
                  <path d="M7 10.5L12 5.5L17 10.5L12 15.5L7 10.5Z" fill="currentColor" />
                  <path d="M7 13.5L12 8.5L17 13.5L12 18.5L7 13.5Z" fill="currentColor" />
                </svg>
                <span className="ml-2 text-white text-xl font-bold font-display">Reem Team</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                  <Home className="h-4 w-4 inline mr-1" />
                  Home
                </Link>
                <Link to="/lobby" className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/lobby' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                  <LayoutList className="h-4 w-4 inline mr-1" />
                  Game Lobby
                </Link>
                <Link to="/rules" className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/rules' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                  <BookOpen className="h-4 w-4 inline mr-1" />
                  Rules
                </Link>
                <Link to="/withdraw" className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/withdraw' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Withdrawals
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="flex items-center">
                  <div className="mr-3 text-sm text-gray-300">
                    <span className="hidden lg:inline mr-1">Balance:</span>
                    <span className="text-white font-semibold">${user.balance}</span>
                  </div>
                  <div className="relative">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium text-white">{user.username}</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.avatar}
                        alt={user.username}
                      />
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <LogOut className="h-4 w-4 inline mr-1" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <LogIn className="h-4 w-4 inline mr-1" />
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
                  >
                    <User className="h-4 w-4 inline mr-1" />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-4 w-4 inline mr-2" />
              Home
            </Link>
            <Link
              to="/lobby"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/lobby' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <LayoutList className="h-4 w-4 inline mr-2" />
              Game Lobby
            </Link>
            <Link
              to="/rules"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/rules' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Rules
            </Link>
            <Link
              to="/withdraw"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/withdraw' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <DollarSign className="h-4 w-4 inline mr-2" />
              Withdrawals
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {user ? (
              <>
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt={user.username}
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">
                      {user.username}
                    </div>
                    <div className="text-sm font-medium leading-none text-gray-400 mt-1">
                      Balance: ${user.balance}
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="px-2 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4 inline mr-2" />
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
 