import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen, AlertTriangle } from 'lucide-react';
import Toast from './Toast';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateCategory = (parentId = null) => {
    setEditingCategory({
      id: null,
      name: '',
      description: '',
      parentId
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory.name.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const url = editingCategory.id
        ? `http://localhost:5000/api/categories/${editingCategory.id}`
        : 'http://localhost:5000/api/categories';
      
      const method = editingCategory.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingCategory)
      });

      if (response.ok) {
        showToast(editingCategory.id ? 'Category updated!' : 'Category created!', 'success');
        setEditingCategory(null);
        await fetchCategories();
        
        // Odśwież całą stronę żeby navbar się zaktualizował
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to save category', 'error');
      }
    } catch (error) {
      console.error('Save category error:', error);
      showToast('Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('Category deleted!', 'success');
        setDeletingCategory(null);
        fetchCategories();
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to delete category', 'error');
        setDeletingCategory(null);
      }
    } catch (error) {
      console.error('Delete category error:', error);
      showToast('Failed to delete category', 'error');
      setDeletingCategory(null);
    }
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="mb-2">
        <div 
          className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary transition-all"
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="text-text-secondary hover:text-primary"
              >
                {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
            ) : (
              <div className="w-5"></div>
            )}
            
            {hasChildren ? (
              isExpanded ? <FolderOpen className="text-secondary" size={24} /> : <Folder className="text-secondary" size={24} />
            ) : (
              <Folder className="text-text-secondary" size={24} />
            )}
            
            <div>
              <h3 className="font-bold text-primary">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-text-secondary">{category.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleCreateCategory(category.id)}
              className="p-2 text-secondary hover:bg-secondary hover:bg-opacity-10 rounded-lg transition-all"
              title="Add subcategory"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => handleEditCategory(category)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => setDeletingCategory(category)}
              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-secondary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading categories...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>

            <h3 className="text-2xl font-bold text-primary text-center mb-2">
              Delete Category?
            </h3>
            <p className="text-text-secondary text-center mb-6">
              Are you sure you want to delete <span className="font-bold text-primary">"{deletingCategory.name}"</span>? This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setDeletingCategory(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold text-primary mb-6">
              {editingCategory.id ? 'Edit Category' : 'Create New Category'}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                  placeholder="e.g. Men's Clothing"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Description
                </label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                  rows="3"
                  placeholder="Optional description"
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all"
                >
                  {editingCategory.id ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Root Category Button */}
      <button
        onClick={() => handleCreateCategory(null)}
        className="mb-6 bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all flex items-center gap-2"
      >
        <Plus size={20} strokeWidth={3} />
        Create Category
      </button>

      {/* Categories Tree */}
      <div className="space-y-2">
        {categories.map(category => renderCategory(category))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          No categories yet. Create your first category!
        </div>
      )}
    </div>
  );
}
