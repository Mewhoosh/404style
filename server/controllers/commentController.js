const { Comment, CommentVote, User, Product, Category, Notification, ModeratorCategory } = require('../models');
const { Op } = require('sequelize');

// Create comment
exports.createComment = async (req, res) => {
    try {
        const { productId, content, parentId } = req.body;

        const product = await Product.findByPk(productId, {
            include: [{
                model: Category,
                as: 'category'
            }]
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check user role
        const user = await User.findByPk(req.userId);
        let commentStatus = 'pending';

        // Admin comments are auto-approved
        if (user.role === 'admin') {
            commentStatus = 'approved';
        }

        // Moderator comments are auto-approved if they moderate this category OR parent category
        if (user.role === 'moderator') {
            const categoryIds = [product.categoryId];

            // Add all parent categories
            let currentCategory = product.category;
            while (currentCategory && currentCategory.parentId) {
                categoryIds.push(currentCategory.parentId);
                currentCategory = await Category.findByPk(currentCategory.parentId);
            }

            const hasAccess = await ModeratorCategory.findOne({
                where: {
                    userId: req.userId,
                    categoryId: { [Op.in]: categoryIds }
                }
            });

            if (hasAccess) {
                commentStatus = 'approved';
            }
        }

        const comment = await Comment.create({
            content,
            productId,
            parentId: parentId || null,
            userId: req.userId,
            status: commentStatus,
            moderatedBy: commentStatus === 'approved' ? req.userId : null,
            moderatedAt: commentStatus === 'approved' ? new Date() : null
        });

        const createdComment = await Comment.findByPk(comment.id, {
            include: [
                { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'role'] }
            ]
        });

        // Notify moderators only if comment is pending
        if (commentStatus === 'pending') {
            // Get category IDs (current + all parents)
            const categoryIds = [product.categoryId];
            let currentCategory = product.category;
            while (currentCategory && currentCategory.parentId) {
                categoryIds.push(currentCategory.parentId);
                currentCategory = await Category.findByPk(currentCategory.parentId);
            }

            // Find moderators who have access to ANY of these categories
            const moderators = await User.findAll({
                where: { role: 'moderator' },
                include: [{
                    model: ModeratorCategory,
                    as: 'moderatorCategories',
                    where: { categoryId: { [Op.in]: categoryIds } },
                    required: true
                }]
            });

            for (const moderator of moderators) {
                await Notification.create({
                    userId: moderator.id,
                    type: 'comment_reply',
                    message: `New comment waiting for approval on product: ${product.name}`,
                    relatedId: comment.id,
                    relatedType: 'comment'
                });
            }
        }

        res.status(201).json({
            message: commentStatus === 'approved' ? 'Comment posted!' : 'Comment submitted for moderation',
            comment: createdComment
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get comments for product
exports.getProductComments = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.userId;
        const userRole = req.userRole;
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        console.log('🔍 Fetching comments - User ID:', userId, 'Role:', userRole, 'Product:', productId);

        // Base query
        let whereClause = {
            productId,
            parentId: null
        };

        // Add status filter based on role
        if (!userId) {
            // Not logged in - only approved
            whereClause.status = 'approved';
        } else if (userRole === 'user') {
            // Regular user - more complex query
            // We'll filter in JavaScript after fetching
        }
        // Admin and moderator see all

        const { count, rows: comments } = await Comment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName', 'role']
                },
                {
                    model: Comment,
                    as: 'replies',
                    include: [
                        {
                            model: User,
                            as: 'author',
                            attributes: ['id', 'firstName', 'lastName', 'role']
                        }
                    ]
                },
                {
                    model: CommentVote,
                    as: 'votes'
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        console.log('💬 Raw comments found:', comments.length);
        console.log('📋 Comments details:', comments.map(c => ({ id: c.id, userId: c.userId, status: c.status })));

        // Filter comments based on role
        let filteredComments = comments;

        if (userRole === 'user') {
            // User sees: approved OR their own (any status)
            filteredComments = comments.filter(comment => {
                const isApproved = comment.status === 'approved';
                const isOwn = comment.userId === userId;
                console.log(`🔎 Comment ${comment.id}: status=${comment.status}, userId=${comment.userId}, requestUserId=${userId}, isApproved=${isApproved}, isOwn=${isOwn}`);
                return isApproved || isOwn;
            });
        }

        console.log('✅ After filtering:', filteredComments.length);

        // Filter replies with same logic
        const finalComments = filteredComments.map(comment => {
            const commentData = comment.toJSON();

            if (commentData.replies && commentData.replies.length > 0) {
                commentData.replies = commentData.replies.filter(reply => {
                    if (reply.status === 'approved') return true;
                    if (!userId) return false;
                    if (reply.userId === userId) return true;
                    if (userRole && userRole !== 'user') return true;
                    return false;
                });
            }

            return commentData;
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            comments: finalComments,
            pagination: {
                page,
                limit,
                total: count,
                totalPages
            }
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending comments (moderator/admin)
exports.getPendingComments = async (req, res) => {
    try {
        let whereClause = { status: 'pending' };

        // If moderator, filter by assigned categories AND their children
        if (req.userRole === 'moderator') {
            const moderatorCategories = await ModeratorCategory.findAll({
                where: { userId: req.userId },
                attributes: ['categoryId']
            });

            const assignedCategoryIds = moderatorCategories.map(mc => mc.categoryId);

            if (assignedCategoryIds.length === 0) {
                return res.json([]);
            }

            // Get all child categories recursively
            const getAllChildCategoryIds = async (categoryIds) => {
                const allIds = [...categoryIds];
                const children = await Category.findAll({
                    where: { parentId: { [Op.in]: categoryIds } },
                    attributes: ['id']
                });

                if (children.length > 0) {
                    const childIds = children.map(c => c.id);
                    const moreChildren = await getAllChildCategoryIds(childIds);
                    allIds.push(...moreChildren);
                }

                return allIds;
            };

            const allCategoryIds = await getAllChildCategoryIds(assignedCategoryIds);

            whereClause['$product.categoryId$'] = { [Op.in]: allCategoryIds };
        }

        const comments = await Comment.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'categoryId'],
                    include: [{
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name']
                    }]
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.json(comments);
    } catch (error) {
        console.error('Get pending comments error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update comment (only author and only if pending)
exports.updateComment = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId !== req.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (comment.status !== 'pending') {
            return res.status(400).json({ message: 'Can only edit pending comments' });
        }

        const { content } = req.body;
        await comment.update({ content });

        const updatedComment = await Comment.findByPk(comment.id, {
            include: [
                { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'role'] }
            ]
        });

        res.json({
            message: 'Comment updated',
            comment: updatedComment
        });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Moderate comment (approve/reject)
exports.moderateComment = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const comment = await Comment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'firstName', 'email']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'categoryId'],
                    include: [{
                        model: Category,
                        as: 'category'
                    }]
                }
            ]
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if moderator has access to this category OR parent categories
        if (req.userRole === 'moderator') {
            const categoryIds = [comment.product.categoryId];

            // Add all parent categories
            let currentCategory = comment.product.category;
            while (currentCategory && currentCategory.parentId) {
                categoryIds.push(currentCategory.parentId);
                currentCategory = await Category.findByPk(currentCategory.parentId);
            }

            const hasAccess = await ModeratorCategory.findOne({
                where: {
                    userId: req.userId,
                    categoryId: { [Op.in]: categoryIds }
                }
            });

            if (!hasAccess) {
                return res.status(403).json({ message: 'Access denied to this category' });
            }
        }

        await comment.update({
            status,
            moderatedBy: req.userId,
            moderatedAt: new Date()
        });

        // Notify comment author
        await Notification.create({
            userId: comment.userId,
            type: status === 'approved' ? 'comment_approved' : 'comment_rejected',
            message: status === 'approved'
                ? `Your comment on "${comment.product.name}" was approved`
                : `Your comment on "${comment.product.name}" was rejected`,
            relatedId: comment.id,
            relatedType: 'comment'
        });

        res.json({
            message: `Comment ${status}`,
            comment
        });
    } catch (error) {
        console.error('Moderate comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Only author can delete their own comment, or moderator/admin
        if (comment.userId !== req.userId && req.userRole === 'user') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await comment.destroy();

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Vote on comment
exports.voteComment = async (req, res) => {
    try {
        const { vote } = req.body;

        if (![1, -1].includes(vote)) {
            return res.status(400).json({ message: 'Invalid vote value' });
        }

        const comment = await Comment.findByPk(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId === req.userId) {
            return res.status(400).json({ message: 'Cannot vote on your own comment' });
        }

        const existingVote = await CommentVote.findOne({
            where: {
                commentId: comment.id,
                userId: req.userId
            }
        });

        if (existingVote) {
            if (existingVote.vote === vote) {
                await existingVote.destroy();
                await comment.decrement('rating', { by: vote });
            } else {
                await existingVote.update({ vote });
                await comment.increment('rating', { by: vote * 2 });
            }
        } else {
            await CommentVote.create({
                commentId: comment.id,
                userId: req.userId,
                vote
            });
            await comment.increment('rating', { by: vote });
        }

        const updatedComment = await Comment.findByPk(comment.id);

        res.json({
            message: 'Vote recorded',
            rating: updatedComment.rating
        });
    } catch (error) {
        console.error('Vote comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};