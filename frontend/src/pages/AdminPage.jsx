import { useState, useEffect } from 'react';
import { menuAPI, creditsAPI, usersAPI } from '../api/apiClient';
import MenuCard from '../components/MenuCard';
import TransactionTable from '../components/TransactionTable';
import AdminOrdersTab from '../components/AdminOrdersTab';
import AdminDashboard from '../components/AdminDashboard';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Menu form state
  const [menuForm, setMenuForm] = useState({
    mealName: '',
    description: '',
    price: '',
    category: 'breakfast',
    available: true,
    stock: '100',
    dailyLimit: '100',
  });
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);

  // Credits form state
  const [creditForm, setCreditForm] = useState({
    userId: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    if (activeTab === 'menu') {
      fetchMenu();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'transactions') {
      fetchAllTransactions();
    }
  }, [activeTab]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await menuAPI.getAll();
      setMenuItems(
        response.data.data?.menuItems || 
        response.data.menuItems || 
        response.data.data || 
        []
      );
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      setUsers(
        response.data.data?.users || 
        response.data.users || 
        response.data.data || 
        []
      );
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    setLoading(true);
    try {
      const response = await creditsAPI.getTransactions({ limit: 50 });
      setTransactions(
        response.data.data?.transactions || 
        response.data.transactions || 
        response.data.data || 
        []
      );
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...menuForm,
      price: parseFloat(menuForm.price),
      stock: parseInt(menuForm.stock, 10),
      dailyLimit: parseInt(menuForm.dailyLimit, 10),
    };
    try {
      if (editingMenu) {
        await menuAPI.update(editingMenu._id, submitData);
      } else {
        await menuAPI.create(submitData);
      }
      setMenuModalOpen(false);
      setEditingMenu(null);
      resetMenuForm();
      fetchMenu();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEditMenu = (item) => {
    setEditingMenu(item);
    setMenuForm({
      mealName: item.mealName,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available,
      stock: (item.stock ?? 100).toString(),
      dailyLimit: (item.dailyLimit ?? 100).toString(),
    });
    setMenuModalOpen(true);
  };

  const handleDeleteMenu = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await menuAPI.delete(id);
      fetchMenu();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleAvailability = async (id, isAvailable) => {
    try {
      await menuAPI.toggleAvailability(id, isAvailable);
      fetchMenu();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  const handleAddCredits = async (e) => {
    e.preventDefault();
    try {
      await creditsAPI.addCredits({
        userId: creditForm.userId,
        amount: parseFloat(creditForm.amount),
        description: creditForm.description,
      });
      setCreditForm({ userId: '', amount: '', description: '' });
      alert('Credits added successfully!');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add credits');
    }
  };

  const resetMenuForm = () => {
    setMenuForm({
      mealName: '',
      description: '',
      price: '',
      category: 'breakfast',
      available: true,
      stock: '100',
      dailyLimit: '100',
    });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'menu', label: 'Menu Management' },
    { id: 'orders', label: 'Order Management' },
    { id: 'users', label: 'Add Credits' },
    { id: 'transactions', label: 'All Transactions' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 transition-colors duration-200">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage menu, credits, and view transactions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <AdminDashboard />
      )}

      {/* Menu Management Tab */}
      {activeTab === 'menu' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Menu Items</h2>
            <button
              onClick={() => {
                setEditingMenu(null);
                resetMenuForm();
                setMenuModalOpen(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Add Menu Item
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <MenuCard
                  key={item._id}
                  item={item}
                  showAdminControls
                  onEdit={handleEditMenu}
                  onDelete={handleDeleteMenu}
                  onToggle={handleToggleAvailability}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Credits Tab */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add Credits to User</h2>
            <form onSubmit={handleAddCredits} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select User
                </label>
                <select
                  value={creditForm.userId}
                  onChange={(e) => setCreditForm({ ...creditForm, userId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email}) - Balance: ₹{user.creditBalance || 0}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={creditForm.amount}
                  onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={creditForm.description}
                  onChange={(e) => setCreditForm({ ...creditForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="e.g., Monthly allowance"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
              >
                Add Credits
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Users List</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div key={user._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-indigo-600">₹{user.creditBalance || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <AdminOrdersTab />
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">All Transactions</h2>
          <TransactionTable transactions={transactions} loading={loading} />
        </div>
      )}

      {/* Menu Modal */}
      {menuModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 transition-colors duration-200">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              {editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <form onSubmit={handleMenuSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={menuForm.mealName}
                  onChange={(e) => setMenuForm({ ...menuForm, mealName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={menuForm.stock}
                    onChange={(e) => setMenuForm({ ...menuForm, stock: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={menuForm.dailyLimit}
                    onChange={(e) => setMenuForm({ ...menuForm, dailyLimit: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={menuForm.available}
                  onChange={(e) => setMenuForm({ ...menuForm, available: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="available" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Available for purchase
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setMenuModalOpen(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
                >
                  {editingMenu ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
