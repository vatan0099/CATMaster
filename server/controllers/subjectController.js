const Subject = require('../models/Subject');
const Topic = require('../models/Topic');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({}).sort('order');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get topics by subject
// @route   GET /api/subjects/:id/topics
// @access  Private
const getTopicsBySubject = async (req, res) => {
    try {
        // Fetch topics for this subject
        // We want to structure them as hierarchy
        const topics = await Topic.find({ subjectId: req.params.id }).sort('name');

        // Filter out unwanted topics
        const unwantedTopics = [
            'Algebra - P&C',
            'Arithmetic - Profit and Loss',
            'Number Systems - Remainder Theorem'
        ];
        const filteredTopics = topics.filter(t => !unwantedTopics.includes(t.name));

        res.json(filteredTopics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSubjects, getTopicsBySubject };
