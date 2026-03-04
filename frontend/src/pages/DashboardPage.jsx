import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuAPI, creditsAPI, adminAPI } from '../api/apiClient';
import TransactionTable from '../components/TransactionTable';

const DashboardPage = () => {
  const { user, balance, isAdmin } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [availableMenu, setAvailableMenu] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminDashboardData();
    } else {
      fetchUserDashboardData();
    }
  }, [isAdmin]);

  const fetchUserDashboardData = async () => {
    try {
      const [transactionsRes, menuRes] = await Promise.all([
        creditsAPI.getTransactions({ limit: 5 }),
        menuAPI.getAll({ limit: 4, available: 'true' }),
      ]);
      
      setRecentTransactions(
        transactionsRes.data.data?.transactions || 
        transactionsRes.data.transactions || 
        transactionsRes.data.data || 
        []
      );
      setAvailableMenu(
        menuRes.data.data?.menuItems || 
        menuRes.data.menuItems || 
        menuRes.data.data || 
        []
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminDashboardData = async () => {
    try {
      const response = await adminAPI.getStats();
      setAdminStats(response.data.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {isAdmin ? "Here's your admin overview" : "Here's your canteen overview"}
        </p>
      </div>

      {/* Admin Dashboard */}
      {isAdmin && adminStats && (
        <>
          {/* Admin Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">{adminStats.totalUsers}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-green-600">{adminStats.totalOrders}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Today's Orders</p>
                  <p className="text-3xl font-bold text-purple-600">{adminStats.todayOrders}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-indigo-600">₹{adminStats.totalRevenue}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link to="/admin" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full group-hover:bg-yellow-200 transition">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Manage Menu</p>
                  <p className="text-sm text-gray-500">Add, edit, or remove items</p>
                </div>
              </div>
            </Link>

            <Link to="/admin" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-full group-hover:bg-orange-200 transition">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Process Orders</p>
                  <p className="text-sm text-gray-500">{adminStats.pendingOrders} pending orders</p>
                </div>
              </div>
            </Link>

            <Link to="/admin" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition group">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Add Credits</p>
                  <p className="text-sm text-gray-500">Manage user balances</p>
                </div>
              </div>
            </Link>
          </div>
        </>
      )}

      {/* User Dashboard */}
      {!isAdmin && (
        <>
          {/* User Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Credit Balance</p>
                  <p className="text-3xl font-bold text-indigo-600">₹{balance.toFixed(2)}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Recent Transactions</p>
                  <p className="text-3xl font-bold text-green-600">{recentTransactions.length}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Available Menu Items</p>
                  <p className="text-3xl font-bold text-purple-600">{availableMenu.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* User Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
                <Link to="/transactions" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                  View All →
                </Link>
              </div>
              {recentTransactions.length > 0 ? (
                <TransactionTable transactions={recentTransactions} loading={false} />
              ) : (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              )}
            </div>

            {/* Available Menu */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Available Menu</h2>
                <Link to="/menu" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                  View All →
                </Link>
              </div>
              {availableMenu.length > 0 ? (
                <div className="space-y-3">
                  {availableMenu.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{item.mealName}</p>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                      <span className="text-indigo-600 font-semibold">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No menu items available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
