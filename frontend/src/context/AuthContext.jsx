import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, creditsAPI } from '../api/apiClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchBalance();
    }
    setLoading(false);
  }, [token]);

  const fetchBalance = async () => {
    try {
      const response = await creditsAPI.getBalance();
      setBalance(response.data.data?.creditBalance || response.data.creditBalance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token: newToken, ...userData } = response.data.data || response.data;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    await fetchBalance();
    
    return response;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    const { token: newToken, ...userData } = response.data.data || response.data;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    await fetchBalance();
    
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setBalance(0);
  };

  const value = {
    user,
    token,
    loading,
    balance,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    fetchBalance,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
