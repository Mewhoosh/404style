import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Save, ArrowLeft, Loader } from 'lucide-react';
import Toast from '../components/Toast';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
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

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price,
          stock: data.stock,
          categoryId: data.categoryId,
          status: data.status
        });
        setExistingImages(data.images || []);
      } else {
        showToast('Failed to load product', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      showToast('Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const images = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setNewImages([...newImages, ...images]);
  };

  const removeNewImage = (index) => {
    const images = [...newImages];
    URL.revokeObjectURL(images[index].preview);
    images.splice(index, 1);
    setNewImages(images);
  };

  const removeExistingImage = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${id}/images/${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
        showToast('Image removed', 'success');
      }
    } catch (error) {
      console.error('Failed to remove image:', error);
      showToast('Failed to remove image', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Please enter product name', 'error');
      return;
    }

    if (!formData.categoryId) {
      showToast('Please select a category', 'error');
      return;
    }

    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('status', formData.status);

      newImages.forEach((img) => {
        formDataToSend.append('images', img.file);
      });

      const token = localStorage.getItem('token');
      const url = id 
        ? `http://localhost:5000/api/products/${id}`
        : 'http://localhost:5000/api/products';
      
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      showToast(id ? 'Product updated!' : 'Product created!', 'success');
      
      setTimeout(() => {
        navigate('/dashboard', { state: { activeTab: 'products' } });
      }, 1500);
    } catch (error) {
      showToast(error.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-secondary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard', { state: { activeTab: 'products' } })}
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all border-2 border-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-primary">
              {id ? 'Edit Product' : 'Add Product'}
            </h1>
            <p className="text-text-secondary">
              {id ? 'Update product details' : 'Create a new product listing'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 border-2 border-gray-200">
          {/* Product Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-primary mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-all"
              placeholder="e.g. Vintage Denim Jacket"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-primary mb-2">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-all"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-all"
                placeholder="49.99"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-all"
                placeholder="100"
                min="0"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-primary mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-all"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-primary mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition-all"
              rows="5"
              placeholder="Product description..."
            ></textarea>
          </div>

          {/* Images */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-primary mb-4">
              Product Images
            </label>

            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="grid grid-cols-5 gap-4 mb-4">
                {existingImages.map((img) => {
                  const imageUrl = img.imageUrl && (img.imageUrl.startsWith('http://') || img.imageUrl.startsWith('https://'))
                    ? img.imageUrl
                    : `http://localhost:5000${img.imageUrl}`;
                  
                  return (
                    <div key={img.id} className="relative group">
                      <img
                        src={imageUrl}
                        alt="Product"
                        className="w-full h-24 object-cover rounded-lg border-2 border-green-500"
                      />
                    <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                      Saved
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  );
                })}

                {newImages.map((img, idx) => (
                  <div key={`new-${idx}`} className="relative group">
                    <img
                      src={img.preview}
                      alt={`New ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-blue-500"
                    />
                    <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-secondary transition-all bg-gray-50 hover:bg-gray-100">
              <div className="text-center">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm text-gray-500">Click to add more images</p>
                <p className="text-xs text-gray-400 mt-1">Max 5 images total</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={(existingImages.length + newImages.length) >= 5}
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-secondary text-primary py-4 rounded-xl font-bold hover:bg-secondary-light transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader className="animate-spin" size={20} />
                {id ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save size={20} />
                {id ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
