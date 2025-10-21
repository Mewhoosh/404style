import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Package, Users, FolderTree, Palette, Image, MessageSquare, ShoppingCart } from 'lucide-react';
import ThemeEditor from '../components/ThemeEditor';
import CategoryManager from '../components/CategoryManager';
import ProductManager from '../components/ProductManager';

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    categories: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
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

    if (user) fetchStats();
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'products', label: 'Products', icon: Package },
    ...(isAdmin ? [
      { id: 'categories', label: 'Categories', icon: FolderTree },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'colors', label: 'Site Colors', icon: Palette },
    ] : []),
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-black text-primary">
            {isAdmin ? 'ADMIN DASHBOARD' : 'MODERATOR DASHBOARD'}
          </h1>
          <p className="text-text-secondary mt-1">
            Welcome back, <span className="font-bold text-secondary">{user?.firstName}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
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

            {/* Quick Actions - TWOJA WERSJA */}
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
                <button className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-all font-semibold">
                  <Image size={24} />
                  Manage Gallery
                </button>
                <button className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-all font-semibold">
                  <MessageSquare size={24} />
                  Review Comments
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-2">Manage Products</h2>
              <p className="text-text-secondary mb-6">View, edit, and manage your products</p>
              
              <ProductManager />
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-primary mb-2">Manage Categories</h2>
              <p className="text-text-secondary mb-6">Organize your product categories</p>
              
              <CategoryManager />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-primary mb-4">Manage Users & Roles</h2>
            <p className="text-text-secondary">User management coming soon...</p>
          </div>
        )}

        {activeTab === 'colors' && (
          <div>
            <div className="bg-white rounded-xl p-8 border-2 border-gray-200 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2">Site Color Customization</h2>
              <p className="text-text-secondary mb-6">Create and manage color themes for your store</p>
              
              <ThemeEditor />
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-primary mb-4">Gallery & Sliders</h2>
            <p className="text-text-secondary">Gallery management coming soon...</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-primary mb-4">Review Management</h2>
            <p className="text-text-secondary">Review moderation coming soon...</p>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-primary mb-4">Order Management</h2>
            <p className="text-text-secondary">Order tracking coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}