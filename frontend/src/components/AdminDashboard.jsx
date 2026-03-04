import { useState, useEffect } from 'react';
import { adminAPI } from '../api/apiClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: '📦',
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: `Rs ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: '💰',
      color: 'bg-yellow-500',
    },
    {
      title: "Today's Orders",
      value: stats?.todayOrders || 0,
      icon: '📅',
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: '⏳',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Distribution */}
      {stats?.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders by Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{count}</p>
                <p className="text-sm text-gray-500 capitalize">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.userId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      Rs {order.totalAmount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Selling Items */}
      {stats?.topMenuItems && stats.topMenuItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            {stats.topMenuItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800">{item._id}</span>
                </div>
                <span className="text-indigo-600 font-semibold">{item.totalSold} sold</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
