const { Product, ProductImage, Category, User } = require('../models');
const { processImage } = require('../utils/imageProcessor');
const path = require('path');

// Get all products (public)
exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, search, sort = 'createdAt', order = 'DESC', page = 1, limit = 12 } = req.query;

    const where = { status: 'approved' };
    
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { rows: products, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductImage,
          as: 'images',
          where: { isMain: true },
          required: false
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [[sort, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single product (public)
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductImage,
          as: 'images',
          order: [['orderIndex', 'ASC']]
        },
        {
          model: Category,
          as: 'category'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create product (moderator/admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;

    // Check if moderator has access to this category
    if (req.user.role === 'moderator') {
      const assignedCategories = req.user.assignedCategories || [];
      if (!assignedCategories.includes(parseInt(categoryId))) {
        return res.status(403).json({ 
          message: 'You are not assigned to this category' 
        });
      }
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      categoryId,
      createdBy: req.userId,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    // Process uploaded images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const { imageUrl, thumbnailUrl } = await processImage(file.path);

        await ProductImage.create({
          productId: product.id,
          imageUrl,
          thumbnailUrl,
          orderIndex: i,
          isMain: i === 0
        });
      }
    }

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update product (moderator/admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check access rights
    if (req.user.role === 'moderator') {
      const assignedCategories = req.user.assignedCategories || [];
      if (!assignedCategories.includes(product.categoryId)) {
        return res.status(403).json({ 
          message: 'You are not assigned to this category' 
        });
      }
    }

    const { name, description, price, stock, categoryId, status } = req.body;

    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      stock: stock || product.stock,
      categoryId: categoryId || product.categoryId,
      status: status || product.status
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get products for moderator (only their categories)
exports.getModeratorProducts = async (req, res) => {
  try {
    const assignedCategories = req.user.assignedCategories || [];

    if (req.user.role === 'admin') {
      // Admin sees all
      const products = await Product.findAll({
        include: [
          { model: Category, as: 'category' },
          { model: ProductImage, as: 'images' }
        ],
        order: [['createdAt', 'DESC']]
      });
      return res.json(products);
    }

    // Moderator sees only their categories
    const products = await Product.findAll({
      where: {
        categoryId: assignedCategories
      },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Get moderator products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};