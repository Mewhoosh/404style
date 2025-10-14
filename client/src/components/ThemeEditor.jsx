import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader } from 'lucide-react';
import Toast from './Toast';

export default function ThemeEditor() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [toast, setToast] = useState(null);
  const [previewColors, setPreviewColors] = useState({
    colorPrimary: '#0a0e27',
    colorSecondary: '#ff6b35',
    colorAccent: '#f7f7f7'
  });

  useEffect(() => {
    fetchThemes();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchThemes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/themes');
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
      showToast('Failed to load themes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTheme = () => {
    setEditingTheme({
      id: null,
      name: '',
      colorPrimary: '#0a0e27',
      colorSecondary: '#ff6b35',
      colorAccent: '#f7f7f7',
      isDefault: false
    });
  };

  const handleEditTheme = (theme) => {
    setEditingTheme({ ...theme });
    setPreviewColors({
      colorPrimary: theme.colorPrimary,
      colorSecondary: theme.colorSecondary,
      colorAccent: theme.colorAccent
    });
  };

  const handleSaveTheme = async () => {
    // Validation
    if (!editingTheme.name.trim()) {
      showToast('Please enter a theme name', 'error');
      return;
    }

    if (!editingTheme.colorPrimary || !editingTheme.colorSecondary || !editingTheme.colorAccent) {
      showToast('Please select all colors', 'error');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingTheme.id
        ? `http://localhost:5000/api/themes/${editingTheme.id}`
        : 'http://localhost:5000/api/themes';
      
      const method = editingTheme.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingTheme)
      });

      if (response.ok) {
        showToast(editingTheme.id ? 'Theme updated!' : 'Theme created!', 'success');
        setEditingTheme(null);
        fetchThemes();
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to save theme', 'error');
      }
    } catch (error) {
      console.error('Save theme error:', error);
      showToast('Failed to save theme', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheme = async (themeId) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/themes/${themeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('Theme deleted!', 'success');
        fetchThemes();
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to delete theme', 'error');
      }
    } catch (error) {
      console.error('Delete theme error:', error);
      showToast('Failed to delete theme', 'error');
    }
  };

  const applyPreview = () => {
    document.documentElement.style.setProperty('--color-primary', previewColors.colorPrimary);
    document.documentElement.style.setProperty('--color-secondary', previewColors.colorSecondary);
    document.documentElement.style.setProperty('--color-accent', previewColors.colorAccent);
    showToast('Preview applied! Refresh to reset.', 'success');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-secondary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading themes...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Editor Modal */}
      {editingTheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-primary mb-6">
              {editingTheme.id ? 'Edit Theme' : 'Create New Theme'}
            </h3>

            {/* Theme Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-2">
                Theme Name *
              </label>
              <input
                type="text"
                value={editingTheme.name}
                onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                placeholder="e.g. Dark Mode, Ocean Blue"
              />
            </div>

            {/* Color Pickers */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Primary Color *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editingTheme.colorPrimary}
                    onChange={(e) => {
                      setEditingTheme({ ...editingTheme, colorPrimary: e.target.value });
                      setPreviewColors({ ...previewColors, colorPrimary: e.target.value });
                    }}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-200"
                  />
                  <input
                    type="text"
                    value={editingTheme.colorPrimary}
                    onChange={(e) => {
                      setEditingTheme({ ...editingTheme, colorPrimary: e.target.value });
                      setPreviewColors({ ...previewColors, colorPrimary: e.target.value });
                    }}
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Secondary Color *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editingTheme.colorSecondary}
                    onChange={(e) => {
                      setEditingTheme({ ...editingTheme, colorSecondary: e.target.value });
                      setPreviewColors({ ...previewColors, colorSecondary: e.target.value });
                    }}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-200"
                  />
                  <input
                    type="text"
                    value={editingTheme.colorSecondary}
                    onChange={(e) => {
                      setEditingTheme({ ...editingTheme, colorSecondary: e.target.value });
                      setPreviewColors({ ...previewColors, colorSecondary: e.target.value });
                    }}
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Accent Color *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editingTheme.colorAccent}
                    onChange={(e) => {
                      setEditingTheme({ ...editingTheme, colorAccent: e.target.value });
                      setPreviewColors({ ...previewColors, colorAccent: e.target.value });
                    }}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-200"
                  />
                  <input
                    type="text"
                    value={editingTheme.colorAccent}
                    onChange={(e) => {
                      setEditingTheme({ ...editingTheme, colorAccent: e.target.value });
                      setPreviewColors({ ...previewColors, colorAccent: e.target.value });
                    }}
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Preview Button */}
            <button
              onClick={applyPreview}
              className="w-full mb-4 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all"
            >
              Preview Colors Live
            </button>

            {/* Default Checkbox */}
            <label className="flex items-center gap-2 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={editingTheme.isDefault}
                onChange={(e) => setEditingTheme({ ...editingTheme, isDefault: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">Set as default theme</span>
            </label>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveTheme}
                disabled={saving}
                className="flex-1 bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Saving...
                  </>
                ) : (
                  'Save Theme'
                )}
              </button>
              <button
                onClick={() => {
                  setEditingTheme(null);
                  window.location.reload();
                }}
                disabled={saving}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleCreateTheme}
        className="mb-6 bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all flex items-center gap-2"
      >
        <Plus size={20} strokeWidth={3} />
        Create New Theme
      </button>

      {/* Themes List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary">
                {theme.name}
                {theme.isDefault && (
                  <span className="ml-2 text-xs bg-secondary text-primary px-2 py-1 rounded-full">
                    DEFAULT
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTheme(theme)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Edit2 size={18} />
                </button>
                {!theme.isDefault && (
                  <button
                    onClick={() => handleDeleteTheme(theme.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div
                  className="w-full h-16 rounded-lg mb-2 border-2 border-gray-200"
                  style={{ backgroundColor: theme.colorPrimary }}
                ></div>
                <p className="text-xs font-mono text-center">{theme.colorPrimary}</p>
              </div>
              <div>
                <div
                  className="w-full h-16 rounded-lg mb-2 border-2 border-gray-200"
                  style={{ backgroundColor: theme.colorSecondary }}
                ></div>
                <p className="text-xs font-mono text-center">{theme.colorSecondary}</p>
              </div>
              <div>
                <div
                  className="w-full h-16 rounded-lg mb-2 border-2 border-gray-200"
                  style={{ backgroundColor: theme.colorAccent }}
                ></div>
                <p className="text-xs font-mono text-center">{theme.colorAccent}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          No themes yet. Create your first theme!
        </div>
      )}
    </div>
  );
}