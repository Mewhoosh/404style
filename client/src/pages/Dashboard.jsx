import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Package, Users, FolderTree, Palette, Image, MessageSquare, ShoppingCart } from 'lucide-react';
import ThemeEditor from '../components/ThemeEditor';
import CategoryManager from '../components/CategoryManager';
import ProductManager from '../components/ProductManager';
import SliderManager from '../components/SliderManager';
import OrderManager from '../components/OrderManager';
import CommentModeration from '../components/CommentModeration';
import UserManagement from '../components/UserManagement';

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(user?.role === 'moderator' ? 'reviews' : 'overview');
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    categories: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/stats/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    if (user) {
      // Set default tab for moderator
      if (user.role === 'moderator' && activeTab === 'overview') {
        setActiveTab('reviews');
      }
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-secondary"></div>
      </div>
    );
  }

  if (!isAuthenticated() || user?.role === 'user') {
    return <Navigate to="/" />;
  }

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';

  const tabs = isModerator ? [
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  ] : [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'colors', label: 'Site Colors', icon: Palette },
    { id: 'gallery', label: 'Sliders', icon: Image },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b-2 border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-black text-primary">
            {isAdmin ? 'ADMIN DASHBOARD' : 'MODERATOR DASHBOARD'}
          </h1>
          <p className="text-text-secondary mt-1">
            Welcome back, <span className="font-bold text-secondary">{user?.firstName}</span>
          </p>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
                    ? 'text-secondary border-b-4 border-secondary'
                    : 'text-text-secondary hover:text-primary border-b-4 border-transparent'
                    }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!isModerator && activeTab === 'overview' && (
          <div>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary transition-all hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
                    <Package className="text-white" size={28} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold text-primary">PRODUCTS</span>
                </div>
                <p className="text-4xl font-black text-primary mb-1">{stats.products}</p>
                <p className="text-sm text-text-secondary">Total products</p>
              </div>

              {isAdmin && (
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
                      <Users className="text-white" size={28} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-primary">USERS</span>
                  </div>
                  <p className="text-4xl font-black text-primary mb-1">{stats.users}</p>
                  <p className="text-sm text-text-secondary">Registered</p>
                </div>
              )}

              {isAdmin && (
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
                      <FolderTree className="text-white" size={28} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-primary">CATEGORIES</span>
                  </div>
                  <p className="text-4xl font-black text-primary mb-1">{stats.categories}</p>
                  <p className="text-sm text-text-secondary">Active</p>
                </div>
              )}

              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-secondary transition-all hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center">
                    <ShoppingCart className="text-primary" size={28} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold text-secondary">REVENUE</span>
                </div>
                <p className="text-4xl font-black text-primary mb-1">${stats.revenue.toFixed(0)}</p>
                <p className="text-sm text-text-secondary">Total sales</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-primary mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  to="/dashboard/products/new"
                  className="flex items-center gap-3 p-4 border-2 border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-primary transition-all font-semibold"
                >
                  <Package size={24} />
                  Add New Product
                </Link>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-all font-semibold"
                >
                  <Image size={24} />
                  Manage Sliders
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-all font-semibold"
                >
                  <ShoppingCart size={24} />
                  View Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {!isModerator && activeTab === 'products' && (
          <div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-2">Manage Products</h2>
              <p className="text-text-secondary mb-6">View, edit, and manage your products</p>

              <ProductManager />
            </div>
          </div>
        )}

        {!isModerator && activeTab === 'categories' && (
          <div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-2">Manage Categories</h2>
              <p className="text-text-secondary mb-6">Organize your product categories</p>

              <CategoryManager />
            </div>
          </div>
        )}

        {!isModerator && activeTab === 'users' && (
          <div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-2">User Management</h2>
              <p className="text-text-secondary mb-6">Manage users and assign moderators to categories</p>

              <UserManagement />
            </div>
          </div>
        )}

        {!isModerator && activeTab === 'colors' && (
          <div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2">Site Color Customization</h2>
              <p className="text-text-secondary mb-6">Create and manage color themes for your store</p>

              <ThemeEditor />
            </div>
          </div>
        )}

        {!isModerator && activeTab === 'gallery' && (
          <div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-2">Slider Management</h2>
              <p className="text-text-secondary mb-6">Create and manage homepage sliders</p>

              <SliderManager />
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-2">Comment Moderation</h2>
              <p className="text-text-secondary mb-6">Review and moderate user comments</p>

              <CommentModeration />
            </div>
          </div>
        )}

        {!isModerator && activeTab === 'orders' && (
          <div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-2">Order Management</h2>
              <p className="text-text-secondary mb-6">Track and manage all orders</p>

              <OrderManager />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}