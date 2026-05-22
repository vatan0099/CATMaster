const express = require('express');
const router = express.Router();
const { getSubjects, getTopicsBySubject } = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSubjects);
router.get('/:id/topics', protect, getTopicsBySubject);

module.exports = router;
