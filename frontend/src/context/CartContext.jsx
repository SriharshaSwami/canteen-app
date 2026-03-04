import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api/apiClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart from server
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await cartAPI.get();
      setCart(response.data.data);
    } catch (err) {
      // 404 means no cart exists yet, which is fine
      if (err.response?.status === 404) {
        setCart({ items: [], totalAmount: 0 });
      } else {
        setError(err.response?.data?.message || 'Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch cart on user change
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = async (menuItemId, quantity = 1) => {
    setError(null);
    try {
      const response = await cartAPI.addItem(menuItemId, quantity);
      setCart(response.data.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add item to cart';
      setError(message);
      return { success: false, message };
    }
  };

  // Update item quantity
  const updateQuantity = async (menuItemId, quantity) => {
    setError(null);
    try {
      const response = await cartAPI.updateItem(menuItemId, quantity);
      setCart(response.data.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update quantity';
      setError(message);
      return { success: false, message };
    }
  };

  // Remove item from cart
  const removeFromCart = async (menuItemId) => {
    setError(null);
    try {
      const response = await cartAPI.removeItem(menuItemId);
      setCart(response.data.data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove item';
      setError(message);
      return { success: false, message };
    }
  };

  // Clear cart
  const clearCart = async () => {
    setError(null);
    try {
      await cartAPI.clear();
      setCart({ items: [], totalAmount: 0 });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to clear cart';
      setError(message);
      return { success: false, message };
    }
  };

  // Checkout cart
  const checkout = async (notes = '') => {
    setError(null);
    try {
      const response = await cartAPI.checkout(notes);
      setCart({ items: [], totalAmount: 0 });
      return { success: true, order: response.data.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Checkout failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Get item count
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = {
    cart,
    loading,
    error,
    itemCount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
