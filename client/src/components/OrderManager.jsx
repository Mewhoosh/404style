import { useState, useEffect } from 'react';
import { Package, Search, Filter, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import Toast from './Toast';

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchOrders = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchOrders();
        showToast('Order status updated successfully!', 'success');
      } else {
        showToast('Failed to update order status', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast('Failed to update order status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.shippingEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.shippingFirstName} ${order.shippingLastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-secondary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by ID, email, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none appearance-none"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="text-secondary" size={24} />
          <span className="font-bold text-primary">Total Orders:</span>
          <span className="text-2xl font-black text-secondary">{filteredOrders.length}</span>
        </div>
      </div>

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-text-secondary bg-white rounded-lg border-2 border-gray-200">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold">No orders found</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
              <div 
                className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="font-bold text-primary text-lg">#{order.id}</div>
                  <div className="text-sm">
                    <div className="font-semibold text-primary">{order.shippingFirstName} {order.shippingLastName}</div>
                    <div className="text-text-secondary">{order.shippingEmail}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getPaymentColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                  <span className="font-bold text-secondary text-lg">${parseFloat(order.totalPrice).toFixed(2)}</span>
                  {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="p-4 border-t-2 border-gray-200 space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-primary mb-3">Order Items</h3>
                      <div className="space-y-2">
                        {order.items?.map(item => (
                          <div key={item.id} className="flex gap-3 pb-2 border-b border-gray-200 last:border-0">
                            <img
                              src={item.product?.images?.[0]?.imageUrl 
                                ? `http://localhost:5000${item.product.images[0].imageUrl}`
                                : 'https://via.placeholder.com/60'}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{item.productName}</p>
                              <p className="text-xs text-text-secondary">
                                ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-primary mb-3">Shipping Address</h3>
                      <div className="text-sm space-y-1 text-text-secondary">
                        <p>{order.shippingAddress}</p>
                        <p>{order.shippingCity}, {order.shippingPostalCode}</p>
                        <p>{order.shippingCountry}</p>
                        <p className="pt-2 border-t border-gray-200 mt-2">
                          <strong>Phone:</strong> {order.shippingPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <h3 className="font-bold text-primary mb-3">Update Order Status</h3>
                    <div className="flex gap-2 flex-wrap">
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          disabled={updating === order.id || order.status === status}
                          className={`px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                            order.status === status
                              ? getStatusColor(status)
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {updating === order.id ? (
                            <Loader className="animate-spin" size={16} />
                          ) : (
                            status.charAt(0).toUpperCase() + status.slice(1)
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-text-secondary border-t-2 border-gray-200 pt-4">
                    <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
                    {order.notes && <p className="mt-1"><strong>Notes:</strong> {order.notes}</p>}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}