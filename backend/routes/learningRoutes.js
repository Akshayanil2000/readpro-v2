const express = require('express');
const router = express.Router();
const { 
    getDashboardData, 
    getInsights,
    startSession, 
    submitSessionResults 
} = require('../controllers/learningController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardData);
router.get('/insights', protect, getInsights);
router.post('/start', protect, startSession);
router.post('/submit', protect, submitSessionResults);

module.exports = router;
