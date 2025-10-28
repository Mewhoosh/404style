const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const uploadDir = 'uploads/';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});

const resizeImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);

    req.file.filename = filename;
    req.file.path = filepath;

    next();
  } catch (error) {
    console.error('Image resize error:', error);
    res.status(500).json({ message: 'Image processing failed' });
  }
};

const resizeMultiple = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    const processedFiles = [];

    for (const file of req.files) {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      const filepath = path.join(uploadDir, filename);

      await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 90 })
        .toFile(filepath);

      processedFiles.push({
        filename: filename,
        path: filepath,
        originalname: file.originalname
      });
    }

    req.files = processedFiles;
    next();
  } catch (error) {
    console.error('Image resize error:', error);
    res.status(500).json({ message: 'Image processing failed' });
  }
};

module.exports = { 
  upload, 
  resizeImage,
  resizeMultiple
};