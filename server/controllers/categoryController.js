const { Category, User, Product } = require('../models');

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces with -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
};

// Get all categories (hierarchical)
exports.getAllCategories = async (req, res) => {
  try {
    // Get all categories
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });

    // Build tree structure
    const buildTree = (parentId = null) => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat.toJSON(),
          children: buildTree(cat.id)
        }));
    };

    const tree = buildTree();
    res.json(tree);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'parent' },
        { model: Category, as: 'children' }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create category (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    // Check if parent exists
    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }

    // Generate slug
    let slug = generateSlug(name);
    
    // Ensure slug is unique
    let counter = 1;
    let uniqueSlug = slug;
    while (await Category.findOne({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const category = await Category.create({
      name,
      slug: uniqueSlug,
      description,
      parentId: parentId || null
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description, parentId } = req.body;

    // Prevent circular reference
    if (parentId && parseInt(parentId) === category.id) {
      return res.status(400).json({ message: 'Category cannot be its own parent' });
    }

    // Check if parent exists
    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }

    // If name changed, regenerate slug
    let updateData = {
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      parentId: parentId !== undefined ? parentId : category.parentId
    };

    if (name && name !== category.name) {
      let slug = generateSlug(name);
      
      // Ensure slug is unique
      let counter = 1;
      let uniqueSlug = slug;
      while (await Category.findOne({ 
        where: { 
          slug: uniqueSlug,
          id: { [require('sequelize').Op.ne]: category.id }
        } 
      })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      
      updateData.slug = uniqueSlug;
    }

    await category.update(updateData);

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has children
    const children = await Category.count({ where: { parentId: category.id } });
    if (children > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with subcategories. Delete subcategories first.' 
      });
    }

    // Check if category has products
    const products = await Product.count({ where: { categoryId: category.id } });
    if (products > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${products} products. Move or delete products first.` 
      });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get category breadcrumbs
exports.getCategoryBreadcrumbs = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const breadcrumbs = [];
    
    let currentCategory = await Category.findByPk(categoryId);
    
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
    
    res.json(breadcrumbs);
  } catch (error) {
    console.error('Get breadcrumbs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};