const express = require('express');
const router = express.Router();
const { getPassage, submitReadingTime, submitAssessment, getAssessmentHistory } = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/assessment/passage
router.get('/passage', protect, getPassage);

// POST /api/assessment/read-complete
router.post('/read-complete', protect, submitReadingTime);

// POST /api/assessment/submit
router.post('/submit', protect, submitAssessment);

// GET /api/assessment/history
router.get('/history', protect, getAssessmentHistory);

module.exports = router;
