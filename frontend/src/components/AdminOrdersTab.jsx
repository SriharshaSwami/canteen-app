import { useState, useEffect } from 'react';
import { ordersAPI } from '../api/apiClient';

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
  accepted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-700',
  preparing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-300 dark:border-purple-700',
  ready: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-300 dark:border-green-700',
  completed: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-300 dark:border-red-700',
};

const statusFlow = ['pending', 'accepted', 'preparing', 'ready', 'completed'];

const AdminOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filter, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter) params.status = filter;
      
      const response = await ordersAPI.getAll(params);
      setOrders(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getNextStatus = (currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => { setFilter(''); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === '' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All Orders
        </button>
        {['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => { setFilter(status); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === status ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['pending', 'accepted', 'preparing', 'ready'].map((status) => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <div key={status} className={`p-4 rounded-lg border ${statusColors[status]}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm capitalize">{status}</p>
            </div>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => {
                const nextStatus = getNextStatus(order.status);
                return (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #{order._id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{order.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{order.userId?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.items.map((item, i) => (
                          <span key={i}>
                            {item.quantity}x {item.mealName}
                            {i < order.items.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      {order.notes && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Note: {order.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Rs {order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {nextStatus && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, nextStatus)}
                          disabled={updatingOrder === order._id}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 capitalize"
                        >
                          {updatingOrder === order._id ? '...' : `Mark ${nextStatus}`}
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                          disabled={updatingOrder === order._id}
                          className="ml-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-between items-center">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersTab;
