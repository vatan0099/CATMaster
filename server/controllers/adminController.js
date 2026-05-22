const User = require('../models/User');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const [userCount, questionCount, activeTestCount] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            Question.countDocuments({}),
            TestAttempt.countDocuments({ status: 'in_progress' })
        ]);

        res.json({
            users: userCount.toString(),
            questions: questionCount.toString(),
            activeTests: activeTestCount.toString()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStats };
