import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

export default function SliderManager() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [newSliderName, setNewSliderName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSliders();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchSliders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sliders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSliders(data);
      }
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
      showToast('Failed to load sliders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlider = async () => {
    if (!newSliderName.trim()) {
      showToast('Please enter slider name', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sliders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newSliderName })
      });

      if (response.ok) {
        showToast('Slider created!', 'success');
        setNewSliderName('');
        fetchSliders();
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to create slider', 'error');
      }
    } catch (error) {
      console.error('Create slider error:', error);
      showToast('Failed to create slider', 'error');
    }
  };

  const handleActivateSlider = async (sliderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/sliders/${sliderId}/activate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showToast('Slider activated!', 'success');
        fetchSliders();
      } else {
        showToast('Failed to activate slider', 'error');
      }
    } catch (error) {
      console.error('Activate slider error:', error);
      showToast('Failed to activate slider', 'error');
    }
  };

  const handleDeleteSlider = async (sliderId) => {
    if (!confirm('Are you sure you want to delete this slider?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/sliders/${sliderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showToast('Slider deleted!', 'success');
        fetchSliders();
      } else {
        showToast('Failed to delete slider', 'error');
      }
    } catch (error) {
      console.error('Delete slider error:', error);
      showToast('Failed to delete slider', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-secondary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading sliders...</p>
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

      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
        <h3 className="text-xl font-bold text-primary mb-4">Create New Slider</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={newSliderName}
            onChange={(e) => setNewSliderName(e.target.value)}
            placeholder="Slider name (e.g. Homepage Slider)"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
          />
          <button
            onClick={handleCreateSlider}
            className="bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Create
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sliders.map(slider => (
          <div
            key={slider.id}
            className={`bg-white rounded-xl p-6 border-2 ${
              slider.isActive ? 'border-secondary' : 'border-gray-200'
            } hover:shadow-lg transition-all`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-primary">{slider.name}</h3>
                {slider.isActive && (
                  <span className="text-xs bg-secondary text-primary px-2 py-1 rounded-full font-bold">
                    ACTIVE
                  </span>
                )}
                <p className="text-sm text-text-secondary mt-1">
                  {slider.items?.length || 0} items
                </p>
              </div>
              <div className="flex gap-2">
                {!slider.isActive && (
                  <button
                    onClick={() => handleActivateSlider(slider.id)}
                    className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-all"
                    title="Activate slider"
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  onClick={() => navigate(`/dashboard/sliders/${slider.id}`)}
                  className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                  title="Edit slider"
                >
                  <Edit2 size={18} />
                </button>
                {!slider.isActive && (
                  <button
                    onClick={() => handleDeleteSlider(slider.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                    title="Delete slider"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sliders.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          No sliders yet. Create your first slider above!
        </div>
      )}
    </div>
  );
}
