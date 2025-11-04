import { useState, useEffect } from 'react';
import { Users, Shield, Trash2, Loader, MessageSquare, ShoppingBag } from 'lucide-react';
import Toast from './Toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchCategories();
    fetchAssignments();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const getCategoryPath = (categoryId, allCategories) => {
    const findPath = (id, cats, path = []) => {
      for (const cat of cats) {
        if (cat.id === id) {
          return [...path, cat.name];
        }
        if (cat.children && cat.children.length > 0) {
          const childPath = findPath(id, cat.children, [...path, cat.name]);
          if (childPath) return childPath;
        }
      }
      return null;
    };
    
    const path = findPath(categoryId, allCategories);
    return path ? path.join(' → ') : '';
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
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
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/moderator-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        showToast(`Role updated to ${newRole}!`, 'success');
        await fetchUsers();
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to update role', 'error');
      }
    } catch (error) {
      console.error('Update role error:', error);
      showToast('Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('User deleted!', 'success');
        await fetchUsers();
      } else {
        const error = await response.json();
        showToast(error.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      showToast('Failed to delete user', 'error');
    }
  };

  const handleAssignCategories = async () => {
    try {
      const token = localStorage.getItem('token');

      // Remove all existing assignments for this moderator
      const userAssignments = assignments.filter(a => a.userId === selectedUser);
      for (const assignment of userAssignments) {
        await fetch(`http://localhost:5000/api/moderator-categories/${assignment.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      // Add new assignments
      for (const categoryId of selectedCategories) {
        await fetch('http://localhost:5000/api/moderator-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: selectedUser,
            categoryId
          })
        });
      }

      showToast('Categories assigned!', 'success');
      setSelectedUser(null);
      setSelectedCategories([]);
      await fetchUsers();
      await fetchAssignments();
    } catch (error) {
      console.error('Assign categories error:', error);
      showToast('Failed to assign categories', 'error');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-700',
      moderator: 'bg-blue-100 text-blue-700',
      user: 'bg-gray-100 text-gray-700'
    };
    return badges[role] || badges.user;
  };

  const renderCategoryTree = (categories, level = 0, parentPath = '') => {
    return categories.map((category) => {
      const currentPath = parentPath ? `${parentPath} → ${category.name}` : category.name;
      const indent = level * 20;
      
      return (
        <div key={category.id}>
          <label 
            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
            style={{ paddingLeft: `${8 + indent}px` }}
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedCategories([...selectedCategories, category.id]);
                } else {
                  setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                }
              }}
              className="w-4 h-4 flex-shrink-0"
            />
            <span className="text-sm flex-1">
              {level > 0 && <span className="text-gray-400 mr-1">└</span>}
              <span className="font-medium">{category.name}</span>
              {level > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  ({currentPath})
                </span>
              )}
            </span>
          </label>
          {category.children && category.children.length > 0 && renderCategoryTree(category.children, level + 1, currentPath)}
        </div>
      );
    });
  };

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

      <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="text-secondary" size={24} />
          <span className="font-bold text-primary">Total Users:</span>
          <span className="text-2xl font-black text-secondary">{users.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-primary uppercase">Categories</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-primary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-primary">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                    <p className="text-xs text-text-secondary">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(user.role)}`}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      {user.stats?.comments || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag size={14} />
                      {user.stats?.orders || 0}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.role === 'moderator' && (
                    <div>
                      {user.moderatorCategories?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {user.moderatorCategories.map(mc => {
                            const categoryPath = getCategoryPath(mc.categoryId, categories);
                            return (
                              <span key={mc.id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {categoryPath || mc.category.name}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user.id);
                            setSelectedCategories([]);
                          }}
                          className="text-xs text-secondary hover:underline font-semibold"
                        >
                          Assign Categories
                        </button>
                      )}
                      {user.moderatorCategories?.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedUser(user.id);
                            setSelectedCategories(user.moderatorCategories.map(mc => mc.categoryId));
                          }}
                          className="text-xs text-secondary hover:underline font-semibold mt-1"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Assignment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">Assign Categories</h3>
            
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {renderCategoryTree(categories)}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAssignCategories}
                className="flex-1 px-4 py-2 bg-secondary text-primary rounded-lg font-bold hover:bg-secondary-light"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedCategories([]);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}