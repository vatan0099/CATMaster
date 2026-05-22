const express = require('express');
const router = express.Router();
const { generateTestQuestions, validateAnswer, getAllQuestions, deleteQuestion, bulkImportQuestions } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateTestQuestions);
router.post('/validate', protect, validateAnswer);

// Admin Routes
router.get('/admin/all', protect, admin, getAllQuestions);
router.post('/bulk', protect, admin, bulkImportQuestions);
router.delete('/:id', protect, admin, deleteQuestion);

module.exports = router;
