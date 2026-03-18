const express = require('express');
const router = express.Router();
const { submitOnboardingSurvey, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/user/onboarding
router.post('/onboarding', protect, submitOnboardingSurvey);

// GET /api/user/profile
router.get('/profile', protect, getUserProfile);

module.exports = router;
