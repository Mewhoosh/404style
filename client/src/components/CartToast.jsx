import { Check, ShoppingCart, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartToast({ product, onClose }) {
  return (
    <div className="fixed top-24 right-4 z-50 bg-white rounded-xl shadow-2xl border-2 border-green-500 p-4 max-w-md animate-slide-right">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="text-green-600" size={24} />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-primary mb-1">Added to cart!</h3>
          <p className="text-sm text-text-secondary mb-3">{product.name}</p>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all"
            >
              Continue Shopping
            </button>
            <Link
              to="/cart"
              className="flex-1 px-3 py-2 bg-secondary text-primary rounded-lg text-sm font-bold hover:bg-secondary-light transition-all flex items-center justify-center gap-1"
            >
              <ShoppingCart size={16} />
              View Cart
            </Link>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
