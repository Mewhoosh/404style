import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-secondary" size={24} />
            <h2 className="text-2xl font-black text-primary">
              Shopping Cart ({getCartCount()})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-xl font-bold text-primary mb-2">Your cart is empty</p>
              <p className="text-text-secondary">Add some products to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 flex gap-4">
                  {/* Image */}
                  <img
                    src={item.image ? `http://localhost:5000${item.image}` : 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-bold text-primary mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-lg font-black text-secondary mb-2">
                      ${parseFloat(item.price).toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:bg-red-100 w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-primary">Subtotal:</span>
              <span className="text-3xl font-black text-secondary">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>

            <Link
              to="/cart"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-secondary text-primary py-4 rounded-xl font-bold hover:bg-secondary-light transition-all flex items-center justify-center gap-2 mb-3"
            >
              <ShoppingCart size={20} />
              View Full Cart
            </Link>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full border-2 border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}