import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Send, Edit2, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';

export default function CommentSection({ productId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchComments();
    }, [productId]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchComments = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            console.log('🔄 Fetching comments for product:', productId);
            console.log('🔑 Token:', token ? 'Present' : 'None');

            const response = await fetch(`http://localhost:5000/api/comments/product/${productId}`, {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Comments received:', data);
                setComments(data);
            } else {
                console.error('Failed to fetch comments:', response.status);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId,
                    content: newComment,
                    parentId: replyingTo
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Comment created:', result);
                setNewComment('');
                setReplyingTo(null);
                await fetchComments();
                showToast('Comment submitted for moderation!', 'success');
            } else {
                const error = await response.json();
                showToast(error.message || 'Failed to submit comment', 'error');
            }
        } catch (error) {
            console.error('Submit comment error:', error);
            showToast('Failed to submit comment', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editingComment?.content.trim()) return;

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: editingComment.content })
            });

            if (response.ok) {
                setEditingComment(null);
                await fetchComments();
                showToast('Comment updated!', 'success');
            } else {
                showToast('Failed to update comment', 'error');
            }
        } catch (error) {
            console.error('Update comment error:', error);
            showToast('Failed to update comment', 'error');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await fetchComments();
                showToast('Comment deleted!', 'success');
            } else {
                showToast('Failed to delete comment', 'error');
            }
        } catch (error) {
            console.error('Delete comment error:', error);
            showToast('Failed to delete comment', 'error');
        }
    };

    const handleVote = async (commentId, vote) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/comments/${commentId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ vote })
            });

            if (response.ok) {
                await fetchComments();
            }
        } catch (error) {
            console.error('Vote error:', error);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', text: 'Pending Review' },
            approved: { icon: CheckCircle, color: 'bg-green-100 text-green-700', text: 'Approved' },
            rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', text: 'Rejected' }
        };
        const badge = badges[status];
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${badge.color}`}>
                <Icon size={12} />
                {badge.text}
            </span>
        );
    };

    const renderComment = (comment, isReply = false) => {
        const isAuthor = user?.id === comment.userId;
        const canEdit = isAuthor && comment.status === 'pending';
        const isEditing = editingComment?.id === comment.id;

        return (
            <div key={comment.id} className={`${isReply ? 'ml-12 mt-4' : 'mb-6'}`}>
                <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                                {comment.author.firstName[0]}{comment.author.lastName[0]}
                            </div>
                            <div>
                                <p className="font-bold text-primary">
                                    {comment.author.firstName} {comment.author.lastName}
                                    {comment.author.role !== 'user' && (
                                        <span className="ml-2 text-xs bg-secondary text-primary px-2 py-1 rounded">
                                            {comment.author.role}
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        {getStatusBadge(comment.status)}
                    </div>

                    {isEditing ? (
                        <div className="mb-3">
                            <textarea
                                value={editingComment.content}
                                onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                                rows="3"
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => handleUpdateComment(comment.id)}
                                    className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold hover:bg-secondary-light"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingComment(null)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-text-secondary mb-3">{comment.content}</p>
                    )}

                    {comment.status === 'pending' && isAuthor && (
                        <div className="mb-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-700">
                                <Clock size={14} className="inline mr-1" />
                                Your comment is waiting for moderator approval. You can edit or delete it while it's pending.
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        {comment.status === 'approved' && (
                            <>
                                <button
                                    onClick={() => handleVote(comment.id, 1)}
                                    disabled={!user || isAuthor}
                                    className="flex items-center gap-1 text-sm font-semibold hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ThumbsUp size={16} />
                                    {comment.rating > 0 && `+${comment.rating}`}
                                </button>
                                <button
                                    onClick={() => handleVote(comment.id, -1)}
                                    disabled={!user || isAuthor}
                                    className="flex items-center gap-1 text-sm font-semibold hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ThumbsDown size={16} />
                                    {comment.rating < 0 && comment.rating}
                                </button>
                                {user && !isReply && (
                                    <button
                                        onClick={() => setReplyingTo(comment.id)}
                                        className="text-sm font-semibold text-secondary hover:underline"
                                    >
                                        Reply
                                    </button>
                                )}
                            </>
                        )}
                        {canEdit && (
                            <>
                                <button
                                    onClick={() => setEditingComment({ id: comment.id, content: comment.content })}
                                    className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {comment.replies?.length > 0 && (
                    <div className="mt-4">
                        {comment.replies.map(reply => renderComment(reply, true))}
                    </div>
                )}

                {replyingTo === comment.id && (
                    <form onSubmit={handleSubmitComment} className="mt-4 ml-12">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                            rows="3"
                            required
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold hover:bg-secondary-light disabled:opacity-50 flex items-center gap-2"
                            >
                                <Send size={16} />
                                {loading ? 'Submitting...' : 'Reply'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setReplyingTo(null);
                                    setNewComment('');
                                }}
                                className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    };

    if (!user) {
        return (
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
                <p className="text-text-secondary">Please log in to view and post comments.</p>
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

            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-2xl font-black text-primary mb-4">Comments</h3>

                {!replyingTo && (
                    <form onSubmit={handleSubmitComment} className="mb-6">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts about this product..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-secondary focus:outline-none"
                            rows="4"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-3 px-6 py-3 bg-secondary text-primary rounded-lg font-bold hover:bg-secondary-light disabled:opacity-50 flex items-center gap-2"
                        >
                            <Send size={18} />
                            {loading ? 'Submitting...' : 'Post Comment'}
                        </button>
                        <p className="text-xs text-text-secondary mt-2">
                            Your comment will be reviewed by a moderator before being published.
                        </p>
                    </form>
                )}

                <div>
                    {comments.length === 0 ? (
                        <p className="text-center text-text-secondary py-8">No comments yet. Be the first to comment!</p>
                    ) : (
                        comments.map(comment => renderComment(comment))
                    )}
                </div>
            </div>
        </div>
    );
}