import { useState } from 'react';
import { useCart } from '../context/CartContext';

const MenuCard = ({ item, showAdminControls = false, onEdit, onDelete, onToggle }) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const result = await addToCart(item._id);
      if (result.success) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } else {
        alert(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const getMealTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-800';
      case 'lunch':
        return 'bg-green-100 text-green-800';
      case 'dinner':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{item.mealName}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(item.category)}`}>
            {item.category}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-indigo-600">Rs {item.price}</span>
          <div className="flex items-center space-x-2">
            {item.stock !== undefined && (
              <span className={`px-2 py-1 rounded text-xs ${
                item.stock > 10 ? 'bg-blue-100 text-blue-800' : 
                item.stock > 0 ? 'bg-orange-100 text-orange-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {item.stock > 0 ? `${item.stock} left` : 'Out of Stock'}
              </span>
            )}
            <span className={`px-2 py-1 rounded text-xs ${
              item.available && item.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {item.available && item.stock > 0 ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        {!showAdminControls && item.available && item.stock > 0 && (
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className={`mt-4 w-full py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed ${
              added 
                ? 'bg-green-600 text-white' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Adding...' : added ? 'Added to Cart' : 'Add to Cart'}
          </button>
        )}

        {!showAdminControls && (!item.available || item.stock === 0) && (
          <button
            disabled
            className="mt-4 w-full py-2 px-4 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}

        {showAdminControls && (
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => onToggle(item._id, !item.available)}
              className={`flex-1 py-2 px-3 rounded-md transition text-sm ${
                item.available
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {item.available ? 'Disable' : 'Enable'}
            </button>
            <button
              onClick={() => onEdit(item)}
              className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md hover:bg-blue-200 transition text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md hover:bg-red-200 transition text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
