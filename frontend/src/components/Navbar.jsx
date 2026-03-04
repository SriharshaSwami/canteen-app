import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, balance } = useAuth();
  const { itemCount } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-indigo-600 dark:bg-gray-800 text-white shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold -ml-1">
              <img 
                src="/favicon.png" 
                alt="Canteen Logo" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
              />
              <span className="hidden sm:inline">Canteen System</span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/dashboard"
                className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                Dashboard
              </Link>
              {!isAdmin && (
                <Link
                  to="/menu"
                  className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition"
                >
                  Menu
                </Link>
              )}
              {!isAdmin && (
                <Link
                  to="/orders"
                  className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition"
                >
                  My Orders
                </Link>
              )}
              <Link
                to="/transactions"
                className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition"
              >
                Transactions
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-indigo-500 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            {/* Cart Icon - only for non-admin users */}
            {!isAdmin && (
              <Link
                to="/cart"
                className="relative hover:bg-indigo-500 dark:hover:bg-gray-700 p-2 rounded-md transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}
            {/* Notification Bell */}
            <NotificationBell />
            {/* Balance - only for non-admin users */}
            {!isAdmin && (
              <div className="bg-indigo-500 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                Rs {balance.toFixed(2)}
              </div>
            )}
            <span className="hidden sm:block">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-indigo-700 dark:bg-gray-600 hover:bg-indigo-800 dark:hover:bg-gray-500 px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className="md:hidden border-t border-indigo-500 dark:border-gray-700 px-4 py-2">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/dashboard"
            className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition text-sm"
          >
            Dashboard
          </Link>
          {!isAdmin && (
            <Link
              to="/menu"
              className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition text-sm"
            >
              Menu
            </Link>
          )}
          {!isAdmin && (
            <Link
              to="/cart"
              className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition text-sm flex items-center gap-1"
            >
              Cart {itemCount > 0 && <span className="bg-red-500 text-xs px-1.5 rounded-full">{itemCount}</span>}
            </Link>
          )}
          {!isAdmin && (
            <Link
              to="/orders"
              className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition text-sm"
            >
              My Orders
            </Link>
          )}
          <Link
            to="/transactions"
            className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition text-sm"
          >
            Transactions
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="hover:bg-indigo-500 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition text-sm"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
