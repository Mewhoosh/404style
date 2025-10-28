const express = require('express');
const router = express.Router();
const sliderController = require('../controllers/sliderController');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const { upload, resizeImage } = require('../middleware/upload');

// Public route
router.get('/active', sliderController.getActiveSlider);

// Admin routes
router.get('/', authMiddleware, isAdmin, sliderController.getAllSliders);
router.get('/:id', authMiddleware, isAdmin, sliderController.getSliderById);
router.post('/', authMiddleware, isAdmin, sliderController.createSlider);
router.put('/:id', authMiddleware, isAdmin, sliderController.updateSlider);
router.put('/:id/activate', authMiddleware, isAdmin, sliderController.setActiveSlider);
router.delete('/:id', authMiddleware, isAdmin, sliderController.deleteSlider);

// Slider items
router.post('/:id/items/product', authMiddleware, isAdmin, sliderController.addProductToSlider);
router.post('/:id/items/custom', authMiddleware, isAdmin, upload.single('image'), resizeImage, sliderController.addCustomCard);
router.put('/:id/items/reorder', authMiddleware, isAdmin, sliderController.updateItemOrder);
router.delete('/:id/items/:itemId', authMiddleware, isAdmin, sliderController.deleteSliderItem);

module.exports = router;