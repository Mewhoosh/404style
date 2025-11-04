const { Slider, SliderItem, Product, ProductImage } = require('../models');

// Get all sliders (admin/moderator)
exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.findAll({
      include: [
        {
          model: SliderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              include: [
                {
                  model: ProductImage,
                  as: 'images'
                }
              ]
            }
          ]
        }
      ],
      order: [
        ['isActive', 'DESC'],
        ['createdAt', 'DESC'],
        [{ model: SliderItem, as: 'items' }, 'order', 'ASC']
      ]
    });

    res.json(sliders);
  } catch (error) {
    console.error('Get sliders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getActiveSlider = async (req, res) => {
  try {
    const slider = await Slider.findOne({
      where: { isActive: true },
      include: [
        {
          model: SliderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              required: false, // LEFT JOIN zamiast INNER JOIN
              include: [
                {
                  model: ProductImage,
                  as: 'images'
                }
              ]
            }
          ]
        }
      ],
      order: [
        [{ model: SliderItem, as: 'items' }, 'order', 'ASC']
      ]
    });

    if (!slider) {
      return res.json({ items: [] });
    }

    // Filtruj itemy: pokaż custom cards (bez produktu) oraz produkty z statusem 'published'
    const sliderData = slider.toJSON();
    if (sliderData.items) {
      sliderData.items = sliderData.items.filter(item =>
        // Pokaż jeśli: jest custom card (brak productId) LUB produkt jest opublikowany
        !item.productId || (item.product && item.product.status === 'published')
      );
    }

    res.json(sliderData);
  } catch (error) {
    console.error('Get active slider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get slider by ID
exports.getSliderById = async (req, res) => {
  try {
    const slider = await Slider.findByPk(req.params.id, {
      include: [
        {
          model: SliderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              include: [{ model: ProductImage, as: 'images' }]
            }
          ]
        }
      ],
      order: [[{ model: SliderItem, as: 'items' }, 'order', 'ASC']]
    });

    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    res.json(slider);
  } catch (error) {
    console.error('Get slider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create slider (admin/moderator)
exports.createSlider = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    if (isActive) {
      await Slider.update({ isActive: false }, { where: {} });
    }

    const slider = await Slider.create({
      name,
      isActive: isActive || false,
      createdBy: req.userId
    });

    res.status(201).json({
      message: 'Slider created successfully',
      slider
    });
  } catch (error) {
    console.error('Create slider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update slider (admin/moderator)
exports.updateSlider = async (req, res) => {
  try {
    const { name } = req.body;
    const slider = await Slider.findByPk(req.params.id);

    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    await slider.update({ name });

    res.json({
      message: 'Slider updated successfully',
      slider
    });
  } catch (error) {
    console.error('Update slider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set active slider
exports.setActiveSlider = async (req, res) => {
  try {
    await Slider.update({ isActive: false }, { where: {} });

    const slider = await Slider.findByPk(req.params.id);

    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    await slider.update({ isActive: true });

    res.json({
      message: 'Active slider updated',
      slider
    });
  } catch (error) {
    console.error('Set active slider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete slider (admin/moderator)
exports.deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findByPk(req.params.id);

    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    await SliderItem.destroy({ where: { sliderId: slider.id } });
    await slider.destroy();

    res.json({ message: 'Slider deleted successfully' });
  } catch (error) {
    console.error('Delete slider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add product to slider (admin/moderator)
exports.addProductToSlider = async (req, res) => {
  try {
    const { productId, customDescription } = req.body;
    const sliderId = req.params.id;

    const slider = await Slider.findByPk(sliderId);
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existing = await SliderItem.findOne({
      where: { sliderId, productId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Product already in slider' });
    }

    const maxOrder = await SliderItem.max('order', { where: { sliderId } }) || 0;

    const item = await SliderItem.create({
      sliderId,
      productId,
      order: maxOrder + 1,
      customDescription
    });

    res.status(201).json({
      message: 'Product added to slider',
      item
    });
  } catch (error) {
    console.error('Add product to slider error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add custom card to slider
exports.addCustomCard = async (req, res) => {
  try {
    const { customTitle, customDescription } = req.body;
    const sliderId = req.params.id;

    // Validation
    if (!customTitle) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const slider = await Slider.findByPk(sliderId);
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    const customImageUrl = `/uploads/${req.file.filename}`;
    const maxOrder = await SliderItem.max('order', { where: { sliderId } }) || 0;

    const item = await SliderItem.create({
      sliderId,
      order: maxOrder + 1,
      customTitle,
      customDescription: customDescription || '',
      customImageUrl
    });

    res.status(201).json({
      message: 'Custom card added to slider',
      item
    });
  } catch (error) {
    console.error('Add custom card error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update item order
exports.updateItemOrder = async (req, res) => {
  try {
    const { items } = req.body;

    for (const item of items) {
      await SliderItem.update(
        { order: item.order },
        { where: { id: item.id } }
      );
    }

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete slider item (admin/moderator)
exports.deleteSliderItem = async (req, res) => {
  try {
    const item = await SliderItem.findByPk(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.destroy();

    res.json({ message: 'Item removed from slider' });
  } catch (error) {
    console.error('Delete slider item error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};