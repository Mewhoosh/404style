import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, MapPin, Mail, Phone, Loader } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
    
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      updatePaymentStatus();
    }
  }, [id, searchParams]);

  const fetchOrder = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await fetch(`http://localhost:5000/api/orders/${id}/payment-success`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTimeout(() => {
        fetchOrder();
      }, 1000);
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: id })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        alert(error.message || 'Payment failed');
        setPaymentLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setPaymentLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { text: 'Order Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      processing: { text: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
      shipped: { text: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
      delivered: { text: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { text: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    return statusMap[status] || statusMap.pending;
  };

  const getPaymentStatusInfo = (status) => {
    const statusMap = {
      pending: { text: 'Payment Pending', color: 'bg-yellow-100 text-yellow-700' },
      paid: { text: 'Paid', color: 'bg-green-100 text-green-700' },
      failed: { text: 'Payment Failed', color: 'bg-red-100 text-red-700' }
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-secondary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-black text-primary mb-4">Order not found</h1>
          <Link to="/" className="text-secondary hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
  const StatusIcon = statusInfo.icon;
  
  const paymentStatus = searchParams.get('payment');

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {location.state?.message && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
            <p className="text-green-800 font-semibold">{location.state.message}</p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
            <p className="text-green-800 font-semibold">Payment successful! Your order is being processed.</p>
          </div>
        )}

        {paymentStatus === 'cancelled' && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-6 flex items-center gap-3">
            <XCircle className="text-red-600 flex-shrink-0" size={24} />
            <p className="text-red-800 font-semibold">Payment cancelled. You can try again below.</p>
          </div>
        )}

        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-secondary hover:text-secondary-dark mb-4 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-primary">
                  Order Details
                </h1>
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold">
                  ID: {order.id}
                </span>
              </div>
              <p className="text-text-secondary">
                Order placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${statusInfo.color}`}>
                <StatusIcon size={20} />
                {statusInfo.text}
              </span>
              <span className={`px-4 py-2 rounded-lg font-bold ${paymentInfo.color}`}>
                {paymentInfo.text}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-primary mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map(item => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b-2 border-gray-100 last:border-0">
                    <img
                      src={item.product?.images?.[0]?.imageUrl 
                        ? `http://localhost:5000${item.product.images[0].imageUrl}`
                        : 'https://via.placeholder.com/100'}
                      alt={item.productName}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0 border-2 border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-primary mb-2 line-clamp-2">{item.productName}</h3>
                      <div className="text-sm text-text-secondary mb-2 space-y-1">
                        <p>Price: ${parseFloat(item.price).toFixed(2)}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-lg md:text-xl font-black text-secondary">
                        Subtotal: ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <MapPin size={24} className="text-secondary" />
                Shipping Address
              </h2>
              <div className="space-y-2 text-text-secondary">
                <p className="font-bold text-primary text-lg">
                  {order.shippingFirstName} {order.shippingLastName}
                </p>
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}, {order.shippingPostalCode}</p>
                <p className="font-semibold">{order.shippingCountry}</p>
                <div className="pt-3 border-t-2 border-gray-100 mt-3 space-y-2">
                  <p className="flex items-center gap-2">
                    <Mail size={16} className="text-secondary" />
                    <span className="font-medium">Email:</span> {order.shippingEmail}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={16} className="text-secondary" />
                    <span className="font-medium">Phone:</span> {order.shippingPhone}
                  </p>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-gray-200">
                <h2 className="text-xl font-bold text-primary mb-4">Order Notes</h2>
                <p className="text-text-secondary italic">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-xl p-4 md:p-6 border-2 border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-primary mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b-2 border-gray-200">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-bold">${parseFloat(order.totalPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-xl font-bold text-primary">Total</span>
                <span className="text-2xl font-black text-secondary">
                  ${parseFloat(order.totalPrice).toFixed(2)}
                </span>
              </div>

              {order.paymentStatus === 'pending' && (
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                >
                  {paymentLoading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Redirecting to payment...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              )}

              {order.status === 'pending' && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-semibold leading-relaxed">
                    Your order is being processed. You will receive an email confirmation soon.
                  </p>
                </div>
              )}

              {order.status === 'processing' && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-semibold leading-relaxed">
                    Your order is being prepared for shipment.
                  </p>
                </div>
              )}

              {order.status === 'shipped' && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800 font-semibold leading-relaxed">
                    Your order has been shipped. Track your package with the tracking number provided in your email.
                  </p>
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-semibold leading-relaxed">
                    Your order has been delivered. Thank you for shopping with us!
                  </p>
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-semibold leading-relaxed">
                    This order has been cancelled.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}