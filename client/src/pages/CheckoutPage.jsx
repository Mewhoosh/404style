import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Loader, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Poland',
    notes: ''
  });

  useEffect(() => {
    const lastOrderId = sessionStorage.getItem('lastOrderId');
    
    if (cart.length === 0 && !lastOrderId) {
      navigate('/cart');
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
    }

    return () => {
      sessionStorage.removeItem('lastOrderId');
    };
  }, [cart, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You must be logged in to place an order');
        navigate('/login');
        return;
      }

      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        notes: formData.notes
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        const orderId = data.order?.id || data.id;
        
        if (orderId) {
          sessionStorage.setItem('lastOrderId', orderId);
          clearCart();
          
          setTimeout(() => {
            navigate(`/orders/${orderId}`, {
              state: { 
                message: 'Order placed successfully!'
              }
            });
          }, 100);
        } else {
          alert('Order placed successfully!');
          clearCart();
          navigate('/');
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order exception:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const total = subtotal;

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 md:mb-8">
          <Link to="/cart" className="inline-flex items-center gap-2 text-secondary hover:text-secondary-dark mb-4">
            <ArrowLeft size={20} />
            Back to Cart
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-primary mb-2">Checkout</h1>
          <p className="text-text-secondary">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <h2 className="text-xl font-bold text-primary mb-4">Contact Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <h2 className="text-xl font-bold text-primary mb-4">Shipping Address</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">Postal Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                      required
                    >
                      <option value="Poland">Poland</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Spain">Spain</option>
                      <option value="Italy">Italy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Order Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                      rows="3"
                      placeholder="Any special instructions..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <CreditCard size={24} />
                  Payment Method
                </h2>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-semibold mb-2">Payment after order confirmation</p>
                  <p className="text-sm text-blue-700">
                    After placing your order, you will be redirected to the payment page where you can complete your payment securely.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 sticky top-24">
                <h2 className="text-xl font-bold text-primary mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4 pb-4 border-b-2 border-gray-200 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image ? `http://localhost:5000${item.image}` : 'https://via.placeholder.com/60'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-primary line-clamp-2 mb-1">{item.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-secondary">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-bold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-2xl font-bold text-primary">Total</span>
                  <span className="text-2xl font-black text-secondary">${total.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary text-primary py-4 rounded-xl font-bold hover:bg-secondary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-text-secondary text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
