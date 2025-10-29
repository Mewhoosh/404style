const { Product, ProductImage, Category, User } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
}).array('images', 5);

// Helper function to get all subcategory IDs recursively
const getAllSubcategoryIds = async (categoryId) => {
  const ids = [categoryId];
  
  const getChildren = async (parentId) => {
    const children = await Category.findAll({
      where: { parentId },
      attributes: ['id']
    });
    
    for (const child of children) {
      ids.push(child.id);
      await getChildren(child.id);
    }
  };
  
  await getChildren(categoryId);
  return ids;
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, status, search } = req.query;
    console.log('🔍 Query params:', { categoryId, status, search });
    
    const where = {};

    // Category filter - include subcategories
    if (categoryId) {
      const categoryIds = await getAllSubcategoryIds(parseInt(categoryId));
      console.log('📁 Category IDs (with subcategories):', categoryIds);
      where.categoryId = { [Op.in]: categoryIds };
    }

    // Status filter
    if (status) {
      where.status = status;
      console.log('✅ Status filter:', status);
    }

    // Search filter
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    console.log('🎯 Final WHERE clause:', JSON.stringify(where, null, 2));

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('📦 Products found:', products.length);
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
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

// Create product
exports.createProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { name, description, price, stock, categoryId, status } = req.body;

      // Validate category
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Create product
      const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        status: status || 'draft',
        createdBy: req.userId
      });

      // Create product images
      if (req.files && req.files.length > 0) {
        const imagePromises = req.files.map((file, index) => {
          return ProductImage.create({
            productId: product.id,
            imageUrl: `/uploads/products/${file.filename}`,
            isPrimary: index === 0
          });
        });
        await Promise.all(imagePromises);
      }

      // Fetch product with relations
      const createdProduct = await Product.findByPk(product.id, {
        include: [
          { model: Category, as: 'category' },
          { model: ProductImage, as: 'images' }
        ]
      });

      res.status(201).json({
        message: 'Product created successfully',
        product: createdProduct
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};

// Update product
exports.updateProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const { name, description, price, stock, categoryId, status } = req.body;

      // Validate category if changed
      if (categoryId && categoryId !== product.categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) {
          return res.status(404).json({ message: 'Category not found' });
        }
      }

      // Update product
      await product.update({
        name: name || product.name,
        description: description !== undefined ? description : product.description,
        price: price ? parseFloat(price) : product.price,
        stock: stock !== undefined ? parseInt(stock) : product.stock,
        categoryId: categoryId || product.categoryId,
        status: status || product.status
      });

      // Add new images if uploaded
      if (req.files && req.files.length > 0) {
        const existingImages = await ProductImage.count({ where: { productId: product.id } });
        
        const imagePromises = req.files.map((file, index) => {
          return ProductImage.create({
            productId: product.id,
            imageUrl: `/uploads/products/${file.filename}`,
            isPrimary: existingImages === 0 && index === 0
          });
        });
        await Promise.all(imagePromises);
      }

      // Fetch updated product with relations
      const updatedProduct = await Product.findByPk(product.id, {
        include: [
          { model: Category, as: 'category' },
          { model: ProductImage, as: 'images' }
        ]
      });

      res.json({
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductImage, as: 'images' }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated images from database
    await ProductImage.destroy({ where: { productId: product.id } });

    // Delete product
    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete product image
exports.deleteProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    const image = await ProductImage.findOne({
      where: { id: imageId, productId }
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await image.destroy();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set primary image
exports.setPrimaryImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    // Set all images to non-primary
    await ProductImage.update(
      { isPrimary: false },
      { where: { productId } }
    );

    // Set selected image as primary
    const image = await ProductImage.findOne({
      where: { id: imageId, productId }
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await image.update({ isPrimary: true });

    res.json({ message: 'Primary image updated' });
  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get product with breadcrumbs
exports.getProductWithDetails = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Breadcrumbs
    const breadcrumbs = [];
    let currentCategory = product.category;
    
    while (currentCategory) {
      breadcrumbs.unshift({
        id: currentCategory.id,
        name: currentCategory.name,
        slug: currentCategory.slug
      });
      
      if (currentCategory.parentId) {
        currentCategory = await Category.findByPk(currentCategory.parentId);
      } else {
        currentCategory = null;
      }
    }

    res.json({
      ...product.toJSON(),
      breadcrumbs
    });
  } catch (error) {
    console.error('Get product with details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get related products (same category)
exports.getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const relatedProducts = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        status: 'published',
        id: { [Op.ne]: product.id }
      },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' }
      ],
      limit: 4,
      order: [['createdAt', 'DESC']]
    });

    res.json(relatedProducts);
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};