import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart, checkout } = useCart();
  const { balance, fetchBalance } = useAuth();
  const [notes, setNotes] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const handleQuantityChange = async (menuItemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    await updateQuantity(menuItemId, newQuantity);
  };

  const handleRemove = async (menuItemId) => {
    await removeFromCart(menuItemId);
  };

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = async () => {
    if (!cart?.items?.length) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    const result = await checkout(notes);

    if (result.success) {
      await fetchBalance();
      navigate('/orders', { state: { newOrder: result.order } });
    } else {
      setCheckoutError(result.message);
    }

    setCheckoutLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const canAfford = balance >= totalAmount;

  return (
    <div className="max-w-4xl mx-auto transition-colors duration-200">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Shopping Cart</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {checkoutError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {checkoutError}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center transition-colors duration-200">
          <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/menu')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.menuItemId._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center gap-4 transition-colors duration-200">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.menuItemId.mealName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item.menuItemId.category}</p>
                  <p className="text-blue-600 font-medium">Rs {item.price.toFixed(2)} each</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.menuItemId._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.menuItemId._id, item.quantity + 1)}
                    disabled={item.quantity >= 10}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="w-24 text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Rs {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.menuItemId._id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              onClick={handleClear}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4 transition-colors duration-200">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Items ({items.length})</span>
                  <span>Rs {totalAmount.toFixed(2)}</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-2 flex justify-between font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>Rs {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Your Balance</span>
                  <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                    Rs {balance.toFixed(2)}
                  </span>
                </div>
                {!canAfford && (
                  <p className="text-red-600 text-xs mt-1">
                    Insufficient balance. Please add Rs {(totalAmount - balance).toFixed(2)} more.
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  rows={2}
                  placeholder="Any special instructions..."
                  maxLength={500}
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || !canAfford || items.length === 0}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {checkoutLoading ? 'Processing...' : `Place Order - Rs ${totalAmount.toFixed(2)}`}
              </button>

              <button
                onClick={() => navigate('/menu')}
                className="w-full mt-2 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
