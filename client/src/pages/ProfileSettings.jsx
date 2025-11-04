import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { User, ShoppingBag, Palette, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import ThemeSelector from '../components/ThemeSelector';

export default function ProfileSettings() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
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
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      processing: { text: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
      shipped: { text: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
      delivered: { text: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-secondary"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 mb-8">
        <h1 className="text-4xl font-black text-primary mb-2">Profile Settings</h1>
        <p className="text-text-secondary">Manage your account settings and preferences</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
                      activeTab === tab.id
                        ? 'bg-secondary text-primary font-bold'
                        : 'text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mt-6">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-3xl font-black text-primary mx-auto mb-4">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <h3 className="text-lg font-bold text-primary text-center">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-text-secondary text-center">{user?.email}</p>
              <span className="block mt-3 text-center">
                <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                  {user?.role?.toUpperCase()}
                </span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-primary mb-6">Profile Information</h2>
                <p className="text-text-secondary mb-6">Update your personal details</p>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.firstName}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.lastName}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                      disabled
                    />
                    <p className="text-xs text-text-secondary mt-1">Email cannot be changed</p>
                  </div>

                  <button className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-primary mb-6">My Orders</h2>
                <p className="text-text-secondary mb-6">Track and manage your orders</p>
                
                {loadingOrders ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-secondary"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-text-secondary mb-4">You haven't placed any orders yet</p>
                    <Link
                      to="/"
                      className="inline-block bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const statusInfo = getStatusInfo(order.status);
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <Link
                          key={order.id}
                          to={`/orders/${order.id}`}
                          className="block p-6 border-2 border-gray-200 rounded-xl hover:border-secondary transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold text-gray-500">ORDER ID: {order.id}</span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${statusInfo.color}`}>
                                  <StatusIcon size={14} />
                                  {statusInfo.text}
                                </span>
                              </div>
                              <p className="text-sm text-text-secondary mb-2">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-text-secondary">
                                {order.items?.length || 0} items
                              </p>
                            </div>
                            <div className="text-left md:text-right">
                              <p className="text-sm text-text-secondary mb-1">Total</p>
                              <p className="text-2xl font-black text-secondary">
                                ${parseFloat(order.totalPrice).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-primary mb-6">Appearance</h2>
                <p className="text-text-secondary mb-6">Choose your preferred color theme</p>
                
                <ThemeSelector />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}