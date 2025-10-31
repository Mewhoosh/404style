import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <ShoppingCart className="mx-auto text-gray-300 mb-6" size={80} />
          <h1 className="text-3xl md:text-4xl font-black text-primary mb-4">Your cart is empty</h1>
          <p className="text-text-secondary mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-secondary text-primary px-8 py-4 rounded-xl font-bold hover:bg-secondary-light transition-all"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-primary mb-2">Shopping Cart</h1>
          <p className="text-text-secondary">{getCartCount()} items in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-4 md:p-6 border-2 border-gray-200">
                <div className="flex gap-4">
                  <img
                    src={item.image ? `http://localhost:5000${item.image}` : 'https://via.placeholder.com/150'}
                    alt={item.name}
                    className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-lg flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="text-base md:text-xl font-bold text-primary mb-2 hover:text-secondary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xl md:text-2xl font-black text-secondary mb-3">
                      ${parseFloat(item.price).toFixed(2)}
                    </p>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-all flex items-center justify-center"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-base md:text-xl font-bold w-8 md:w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-all flex items-center justify-center"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-text-secondary">Subtotal</p>
                          <p className="text-lg md:text-2xl font-black text-primary">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:bg-red-100 w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="hidden lg:block bg-white rounded-xl p-6 border-2 border-gray-200 sticky top-24">
              <h2 className="text-2xl font-black text-primary mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-bold">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 text-xl">
                <span className="font-bold text-primary">Total</span>
                <span className="font-black text-secondary">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>

              {isAuthenticated() ? (
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-secondary text-primary py-4 rounded-xl font-bold hover:bg-secondary-light transition-all flex items-center justify-center gap-2 mb-3"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </button>
              ) : (
                <div>
                  <p className="text-sm text-text-secondary text-center mb-3">
                    Please login to checkout
                  </p>
                  <Link
                    to="/login"
                    className="w-full bg-secondary text-primary py-4 rounded-xl font-bold hover:bg-secondary-light transition-all flex items-center justify-center"
                  >
                    Login to Continue
                  </Link>
                </div>
              )}

              <Link
                to="/"
                className="w-full border-2 border-gray-300 text-primary py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 z-40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-text-secondary">Total</p>
              <p className="text-2xl font-black text-secondary">
                ${getCartTotal().toFixed(2)}
              </p>
            </div>
            {isAuthenticated() ? (
              <button
                onClick={() => navigate('/checkout')}
                className="bg-secondary text-primary px-6 py-3 rounded-xl font-bold hover:bg-secondary-light transition-all flex items-center gap-2"
              >
                Checkout
                <ArrowRight size={18} />
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-secondary text-primary px-6 py-3 rounded-xl font-bold hover:bg-secondary-light transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        <div className="lg:hidden h-24"></div>
      </div>
    </div>
  );
}