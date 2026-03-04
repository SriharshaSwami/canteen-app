import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ordersAPI } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons = {
  pending: '🕐',
  accepted: '✓',
  preparing: '👨‍🍳',
  ready: '🔔',
  completed: '✅',
  cancelled: '❌',
};

const OrdersPage = () => {
  const location = useLocation();
  const { fetchBalance } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Highlight newly placed order
  const newOrderId = location.state?.newOrder?._id;

  useEffect(() => {
    fetchOrders();
  }, [filter, page]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (filter) params.status = filter;
      
      const response = await ordersAPI.getMyOrders(params);
      setOrders(response.data.data);
      setPagination(response.data.pagination);

      // Auto-expand new order
      if (newOrderId) {
        setExpandedOrder(newOrderId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? You will receive a full refund.')) {
      return;
    }

    try {
      await ordersAPI.cancelOrder(orderId);
      fetchOrders();
      fetchBalance(); // Refresh balance after refund
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

      {/* Success message for new order */}
      {newOrderId && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          Order placed successfully! You can track its status below.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => { setFilter(''); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => { setFilter(status); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {statusIcons[status]} {status}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                order._id === newOrderId ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {/* Order Header */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                    {statusIcons[order.status]} {order.status}
                  </span>
                  <p className="font-semibold text-gray-900">Rs {order.totalAmount.toFixed(2)}</p>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedOrder === order._id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Order Details (Expanded) */}
              {expandedOrder === order._id && (
                <div className="border-t px-4 py-4">
                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.mealName}
                          </span>
                          <span className="text-gray-900">Rs {item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1">Notes</h4>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}

                  {/* Status History */}
                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Status History</h4>
                      <div className="space-y-1">
                        {order.statusHistory.map((history, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${statusColors[history.status].replace('text-', 'bg-').replace('-800', '-500')}`}></span>
                            <span className="text-gray-600 capitalize">{history.status}</span>
                            <span className="text-gray-400">{formatDate(history.changedAt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cancel Button */}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default OrdersPage;
