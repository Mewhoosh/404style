import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import CartToast from './CartToast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [showToast, setShowToast] = useState(false);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/400x300';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `http://localhost:5000${imageUrl}`;
  };

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { text: 'Out of Stock', color: 'text-red-600', show: true };
    } else if (stock < 20) {
      return { text: 'Last Items!', color: 'text-orange-600', show: true };
    } else if (stock < 100) {
      return { text: 'Low Stock', color: 'text-yellow-600', show: true };
    } else {
      return { text: 'In Stock', color: 'text-green-600', show: false };
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const imageUrl = getImageUrl(product.images?.[0]?.imageUrl);
  const stockStatus = getStockStatus(product.stock);

  return (
    <>
      {showToast && (
        <CartToast 
          product={product} 
          onClose={() => setShowToast(false)} 
        />
      )}
      
      <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-secondary transition-all group">
        {/* Image */}
        <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-xl font-bold">OUT OF STOCK</span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-4">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-sm text-text-secondary mb-3 line-clamp-1">
            {product.category?.name}
          </p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-black text-secondary">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            {stockStatus.show && (
              <span className={`text-xs font-semibold ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              to={`/product/${product.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all font-semibold"
            >
              <Eye size={18} />
              View
            </Link>
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-primary hover:bg-secondary-light rounded-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock === 0}
            >
              <ShoppingCart size={18} />
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
