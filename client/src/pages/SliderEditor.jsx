import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Plus, Trash2, GripVertical, Upload, Package } from 'lucide-react';
import Toast from '../components/Toast';

function SortableItem({ item, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/150';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `http://localhost:5000${imageUrl}`;
  };

  const imageUrl = getImageUrl(
    item.customImageUrl || item.product?.images?.[0]?.imageUrl
  );

  const title = item.customTitle || item.product?.name || 'Untitled';
  const description = item.customDescription || item.product?.description || '';

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl p-4 border-2 border-gray-200">
      <div className="flex gap-4">
        <div {...attributes} {...listeners} className="flex items-center cursor-grab active:cursor-grabbing">
          <GripVertical className="text-gray-400" size={24} />
        </div>
        <img src={imageUrl} alt={title} className="w-24 h-24 object-cover rounded-lg" />
        <div className="flex-1">
          <h4 className="font-bold text-primary mb-1">{title}</h4>
          <p className="text-sm text-text-secondary line-clamp-2">{description}</p>
          {item.product && (
            <p className="text-sm font-bold text-secondary mt-1">
              ${parseFloat(item.product.price).toFixed(2)}
            </p>
          )}
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all h-fit"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default function SliderEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slider, setSlider] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customCard, setCustomCard] = useState({
    title: '',
    description: '',
    image: null
  });

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchSlider();
    fetchProducts();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchSlider = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/sliders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSlider(data);
      }
    } catch (error) {
      console.error('Failed to fetch slider:', error);
      showToast('Failed to load slider', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProduct) {
      showToast('Please select a product', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/sliders/${id}/items/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct,
          customDescription
        })
      });

      if (response.ok) {
        showToast('Product added to slider!', 'success');
        setShowAddProduct(false);
        setSelectedProduct('');
        setCustomDescription('');
        fetchSlider();
      } else {
        showToast('Failed to add product', 'error');
      }
    } catch (error) {
      console.error('Add product error:', error);
      showToast('Failed to add product', 'error');
    }
  };

  const handleAddCustomCard = async () => {
    if (!customCard.title || !customCard.image) {
      showToast('Please fill all fields and select an image', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('customTitle', customCard.title);
      formData.append('customDescription', customCard.description);
      formData.append('image', customCard.image);

      const response = await fetch(`http://localhost:5000/api/sliders/${id}/items/custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        showToast('Custom card added!', 'success');
        setShowAddCustom(false);
        setCustomCard({ title: '', description: '', image: null });
        fetchSlider();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        showToast(errorData.message || 'Failed to add custom card', 'error');
      }
    } catch (error) {
      console.error('Add custom card error:', error);
      showToast('Failed to add custom card', 'error');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Remove this item from slider?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/sliders/${id}/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showToast('Item removed!', 'success');
        fetchSlider();
      } else {
        showToast('Failed to remove item', 'error');
      }
    } catch (error) {
      console.error('Delete item error:', error);
      showToast('Failed to remove item', 'error');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    if (active.id !== over.id) {
      const oldIndex = slider.items.findIndex(item => item.id === active.id);
      const newIndex = slider.items.findIndex(item => item.id === over.id);

      const newItems = arrayMove(slider.items, oldIndex, newIndex);
      setSlider({ ...slider, items: newItems });

      const updatedItems = newItems.map((item, index) => ({
        id: item.id,
        order: index
      }));

      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/sliders/${id}/items/reorder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ items: updatedItems })
        });

        showToast('Order updated!', 'success');
      } catch (error) {
        console.error('Reorder error:', error);
        showToast('Failed to update order', 'error');
        fetchSlider();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-secondary"></div>
      </div>
    );
  }

  if (!slider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">Slider not found</p>
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

      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-primary hover:text-secondary mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl p-8 border-2 border-gray-200 mb-6">
          <h1 className="text-3xl font-black text-primary mb-2">{slider.name}</h1>
          <p className="text-text-secondary">Drag and drop to reorder items</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all flex items-center justify-center gap-2"
          >
            <Package size={20} />
            Add Product from Store
          </button>
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
          >
            <Upload size={20} />
            Add Custom Card
          </button>
        </div>

        {showAddProduct && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
            <h3 className="text-xl font-bold text-primary mb-4">Add Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Select Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                >
                  <option value="">Choose a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${parseFloat(product.price).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Custom Description (optional)
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                  rows="3"
                  placeholder="Override product description..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all"
                >
                  Add to Slider
                </button>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddCustom && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
            <h3 className="text-xl font-bold text-primary mb-4">Add Custom Card</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={customCard.title}
                  onChange={(e) => setCustomCard({ ...customCard, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                  placeholder="Card title..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={customCard.description}
                  onChange={(e) => setCustomCard({ ...customCard, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                  rows="3"
                  placeholder="Card description..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCustomCard({ ...customCard, image: e.target.files[0] })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAddCustomCard}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition-all"
                >
                  Add Custom Card
                </button>
                <button
                  onClick={() => setShowAddCustom(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slider.items?.map(item => item.id) || []} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {slider.items && slider.items.length > 0 ? (
                slider.items.map((item) => (
                  <SortableItem key={item.id} item={item} onDelete={handleDeleteItem} />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
                  <p className="text-text-secondary">No items in slider yet. Add some above!</p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

