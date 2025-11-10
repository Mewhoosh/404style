import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, AlertTriangle, Search } from 'lucide-react';
import Toast from './Toast';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    status: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.status) params.append('status', filters.status);

      console.log('🔍 Fetching products with params:', params.toString());

      const response = await fetch(`http://localhost:5000/api/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Products received:', data.length);
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const data = await response.json();
        const flatCategories = flattenCategories(data);
        setCategories(flatCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const flattenCategories = (categories, prefix = '') => {
    let result = [];
    categories.forEach(cat => {
      result.push({ id: cat.id, name: prefix + cat.name });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, prefix + cat.name + ' > '));
      }
    });
    return result;
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('Product deleted!', 'success');
        setDeletingProduct(null);
        fetchProducts();
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to delete product', 'error');
        setDeletingProduct(null);
      }
    } catch (error) {
      console.error('Delete product error:', error);
      showToast('Failed to delete product', 'error');
      setDeletingProduct(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.draft}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-secondary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>

            <h3 className="text-2xl font-bold text-primary text-center mb-2">
              Delete Product?
            </h3>
            <p className="text-text-secondary text-center mb-6">
              Are you sure you want to delete <span className="font-bold text-primary">"{deletingProduct.name}"</span>? This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeletingProduct(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
            />
          </div>

          <select
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <Link
        to="/dashboard/products/new"
        className="mb-6 inline-flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all"
      >
        <Plus size={20} strokeWidth={3} />
        Add New Product
      </Link>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-primary mb-2">No Products Found</h3>
          <p className="text-text-secondary mb-6">Create your first product to get started.</p>
          <Link
            to="/dashboard/products/new"
            className="inline-flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all"
          >
            <Plus size={20} />
            Add Product
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
            const imageUrl = primaryImage?.imageUrl;
            const fullImageUrl = imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
              ? imageUrl
              : `http://localhost:5000${imageUrl}`;

            return (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary transition-all">
                <div className="relative h-48 bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={fullImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(product.status)}
                  </div>
                </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-primary mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                  {product.category?.name}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-secondary">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  <span className="text-sm text-text-secondary">
                    Stock: <span className="font-bold">{product.stock}</span>
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/product/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    <Eye size={16} />
                    View
                  </Link>
                  <Link
                    to={`/dashboard/products/edit/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeletingProduct(product)}
                    className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
