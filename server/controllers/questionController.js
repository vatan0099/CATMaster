const Question = require('../models/Question');

// @desc    Get questions for test generation
// @route   POST /api/questions/generate
// @access  Private
const generateTestQuestions = async (req, res) => {
    const { subjectId, topicIds, difficulty, count } = req.body;

    try {
        let query = {
            subjectId: subjectId,
            topicId: { $in: topicIds }
        };

        if (difficulty && difficulty !== 'mixed') {
            query.difficulty = difficulty;
        }

        // Random Selection using Aggregation
        // $sample is efficient for random selection
        const questions = await Question.aggregate([
            {
                $match: {
                    subjectId: new require('mongoose').Types.ObjectId(subjectId),
                    topicId: { $in: topicIds.map(id => new require('mongoose').Types.ObjectId(id)) },
                    ...(difficulty && difficulty !== 'mixed' ? { difficulty } : {})
                }
            },
            { $sample: { size: Number(count) || 10 } }
        ]);

        // If we need to hide correct answer, we can project here.
        // For security, usually we send questions WITHOUT correctAnswer to frontend, 
        // and validate answers on backend submission.
        // However, for practice mode with immediate feedback, we might send it masked or fetch answer separately.
        // Let's send full question for now, but in production we'd strip 'correctAnswer'.

        // Strip sensitive data if needed
        const sanitizedQuestions = questions.map(q => ({
            ...q,
            correctAnswer: undefined, // Hide answer
            solution: undefined // Hide solution until attempted
        }));

        res.json(sanitizedQuestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate answer (for immediate feedback mode)
// @route   POST /api/questions/validate
// @access  Private
const validateAnswer = async (req, res) => {
    const { questionId, selectedOption } = req.body;

    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const isCorrect = question.correctAnswer === selectedOption;

        res.json({
            isCorrect,
            correctAnswer: question.correctAnswer, // Reveal answer
            solution: question.solution
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Subject = require('../models/Subject');
const Topic = require('../models/Topic');

// @desc    Get all questions (Admin)
// @route   GET /api/questions/admin/all
// @access  Private/Admin
const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find({})
            .populate('subjectId', 'name')
            .populate('topicId', 'name')
            .sort('-createdAt');
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        await question.deleteOne();
        res.json({ message: 'Question removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk Import Questions
// @route   POST /api/questions/bulk
// @access  Private/Admin
const bulkImportQuestions = async (req, res) => {
    try {
        const questionsData = req.body;

        if (!Array.isArray(questionsData) || questionsData.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of questions.' });
        }

        // Fetch Maps
        const subjects = await Subject.find({});
        const subjectsByName = {};
        subjects.forEach(s => subjectsByName[s.name] = s._id);

        const preparedQuestions = [];
        const errors = [];

        // Cache for newly created topics during this session
        const processedTopics = {}; // { 'SubjectName|TopicName': ObjectId }

        for (let i = 0; i < questionsData.length; i++) {
            const q = questionsData[i];
            const subjectName = q.subject;
            const topicName = q.topic;

            if (!subjectsByName[subjectName]) {
                errors.push(`Row ${i + 1}: Subject "${subjectName}" not found in database.`);
                continue;
            }

            const subjectId = subjectsByName[subjectName];
            const trimmedTopic = topicName.trim();
            const topicCacheKey = `${subjectName}|${trimmedTopic.toLowerCase()}`;

            let topicId;
            if (processedTopics[topicCacheKey]) {
                topicId = processedTopics[topicCacheKey];
            } else {
                // Check if topic exists in DB (Case-insensitive)
                let topic = await Topic.findOne({
                    name: { $regex: new RegExp(`^${trimmedTopic}$`, 'i') },
                    subjectId
                });

                if (!topic) {
                    // Create new topic if doesn't exist
                    topic = await Topic.create({
                        name: trimmedTopic,
                        subjectId,
                        level: 0
                    });
                }
                topicId = topic._id;
                processedTopics[topicCacheKey] = topicId;
            }

            preparedQuestions.push({
                ...q,
                subjectId,
                topicId
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Import validation failed', errors });
        }

        await Question.insertMany(preparedQuestions);

        res.status(201).json({
            message: `Successfully imported ${preparedQuestions.length} questions and resolved topics.`,
            count: preparedQuestions.length
        });

    } catch (error) {
        console.error('Bulk Import Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateTestQuestions,
    validateAnswer,
    getAllQuestions,
    deleteQuestion,
    bulkImportQuestions
};
