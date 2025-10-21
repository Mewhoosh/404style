import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';

export default function ProductCard({ product }) {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage 
    ? `http://localhost:5000${primaryImage.imageUrl}`
    : 'https://via.placeholder.com/400x500?text=No+Image';

  return (
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
          {product.stock > 0 && product.stock < 10 && (
            <span className="text-xs text-red-600 font-semibold">
              Only {product.stock} left!
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
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-primary hover:bg-secondary-light rounded-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.stock === 0}
          >
            <ShoppingCart size={18} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}