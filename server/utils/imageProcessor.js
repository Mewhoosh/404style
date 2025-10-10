const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const processImage = async (imagePath) => {
  try {
    const filename = path.basename(imagePath);
    const thumbnailPath = path.join(__dirname, '../uploads/thumbnails', 'thumb-' + filename);

    // Create thumbnail (300x300)
    await sharp(imagePath)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Optimize original image (max 1200px width)
    await sharp(imagePath)
      .resize(1200, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 90 })
      .toFile(imagePath + '.tmp');

    // Replace original with optimized
    await fs.unlink(imagePath);
    await fs.rename(imagePath + '.tmp', imagePath);

    return {
      imageUrl: `/uploads/products/${filename}`,
      thumbnailUrl: `/uploads/thumbnails/thumb-${filename}`
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
};

module.exports = { processImage };