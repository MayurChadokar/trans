const express = require('express');
const router = express.Router();
const { getBanners, updateBanners } = require('../controllers/system.controller');
const { authRequired, adminRequired } = require('../middleware/auth.middleware');

// Public/User access to see banners
router.get('/banners', getBanners);

// Admin only access to manage banners
router.post('/banners', authRequired, updateBanners);

module.exports = router;
