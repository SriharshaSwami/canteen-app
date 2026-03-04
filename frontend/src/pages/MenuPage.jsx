import { useState, useEffect } from 'react';
import { menuAPI } from '../api/apiClient';
import MenuCard from '../components/MenuCard';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMenu();
  }, [filter]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') {
        params.category = filter;
      }
      const response = await menuAPI.getAll(params);
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

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'breakfast', label: '🌅 Breakfast' },
    { value: 'lunch', label: '☀️ Lunch' },
    { value: 'dinner', label: '🌙 Dinner' },
    { value: 'snacks', label: '🍿 Snacks' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 transition-colors duration-200">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Menu</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Browse and purchase meals</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
              filter === btn.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : menuItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <MenuCard key={item._id} item={item} onPurchase={fetchMenu} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No menu items found</p>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
