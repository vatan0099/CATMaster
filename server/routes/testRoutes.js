const express = require('express');
const router = express.Router();
const { startTest, submitTest, getHistory, getAttempt, retakeTest, deleteAttempt, saveProgress } = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startTest);
router.post('/:id/submit', protect, submitTest);
router.post('/:id/retake', protect, retakeTest);
router.delete('/:id', protect, deleteAttempt);
router.post('/:id/progress', protect, saveProgress);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getAttempt);

module.exports = router;
