const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', protect, authorize('MANAGER', 'OWNER', 'ADMIN'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: 'Cloudinary credentials are not configured on the server.' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const uploadRes = await cloudinary.uploader.upload(dataURI, {
      folder: 'retailvision',
      resource_type: 'auto'
    });

    res.json({ secure_url: uploadRes.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Image upload failed' });
  }
});

module.exports = router;
