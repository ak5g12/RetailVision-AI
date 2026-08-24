const express = require('express');
const multer = require('multer');
const { previewImport, confirmImport } = require('../controllers/importController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temp storage

router.use(protect);
router.use(authorize('MANAGER', 'OWNER', 'ADMIN'));

router.post('/preview', upload.single('file'), previewImport);
router.post('/confirm', confirmImport);

module.exports = router;
