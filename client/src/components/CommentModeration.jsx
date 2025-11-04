import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, Package, ArrowUpDown } from 'lucide-react';
import Toast from './Toast';

export default function CommentModeration() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState(null);
  const [toast, setToast] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchPendingComments();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchPendingComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/comments/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      showToast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (commentId, status) => {
    setModerating(commentId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showToast(`Comment ${status}!`, 'success');
        await fetchPendingComments();
      } else {
        showToast('Failed to moderate comment', 'error');
      }
    } catch (error) {
      console.error('Moderate error:', error);
      showToast('Failed to moderate comment', 'error');
    } finally {
      setModerating(null);
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

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
          <Package className="text-secondary" size={24} />
          <span className="font-bold text-primary">Pending Comments:</span>
          <span className="text-2xl font-black text-secondary">{comments.length}</span>
        </div>
        
        {comments.length > 0 && (
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200"
          >
            <ArrowUpDown size={18} />
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-12 text-text-secondary bg-white rounded-lg border-2 border-gray-200">
          <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold">All caught up!</p>
          <p>No comments waiting for moderation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map(comment => (
            <div key={comment.id} className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {comment.author.firstName[0]}{comment.author.lastName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-primary">
                        {comment.author.firstName} {comment.author.lastName}
                      </p>
                      <p className="text-xs text-text-secondary">{comment.author.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-text-secondary block mb-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                    <span className="text-xs text-blue-600 font-semibold">
                      {Math.floor((Date.now() - new Date(comment.createdAt)) / 60000)} min ago
                    </span>
                  </div>
                </div>

                <div className="mt-3 mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-text-secondary mb-1">Product:</p>
                  <p className="font-bold text-primary">{comment.product.name}</p>
                  <p className="text-xs text-text-secondary">Category: {comment.product.category.name}</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-text-secondary">{comment.content}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleModerate(comment.id, 'approved')}
                  disabled={moderating === comment.id}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {moderating === comment.id ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleModerate(comment.id, 'rejected')}
                  disabled={moderating === comment.id}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {moderating === comment.id ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <>
                      <XCircle size={20} />
                      Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
