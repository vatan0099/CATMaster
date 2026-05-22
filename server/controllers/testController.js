const TestAttempt = require('../models/TestAttempt');
const Question = require('../models/Question');

// @desc    Start a new test attempt
// @route   POST /api/tests/start
// @access  Private
const mongoose = require('mongoose');

// @desc    Start a new test attempt
// @route   POST /api/tests/start
// @access  Private
const startTest = async (req, res) => {
    try {


        const { subjectId, topicIds, difficulty, questionCount, timerMode, timeLimit } = req.body;

        if (!subjectId) {
            console.log('❌ Missing subjectId');
            return res.status(400).json({ message: 'Subject ID is required.' });
        }
        if (!topicIds || !Array.isArray(topicIds) || topicIds.length === 0) {
            console.log('❌ Invalid topicIds:', topicIds);
            return res.status(400).json({ message: 'Please select at least one topic.' });
        }

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            console.log('❌ Invalid Mongoose ID for subject:', subjectId);
            return res.status(400).json({ message: 'Invalid subject ID.' });
        }

        // 1. Generate Questions - Convert string IDs to ObjectIds properly
        const subjectObjectId = new mongoose.Types.ObjectId(subjectId);
        const topicObjectIds = topicIds.map(id => new mongoose.Types.ObjectId(id));

        let query = {
            subjectId: subjectObjectId,
            topicId: { $in: topicObjectIds }
        };

        if (difficulty && difficulty !== 'mixed') {
            query.difficulty = difficulty;
        }



        const questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: Number(questionCount) || 10 } }
        ]);



        if (questions.length === 0) {
            return res.status(400).json({ message: 'Not enough questions available for selection.' });
        }

        // 2. Prepare Attempt Questions (Initial status)
        const attemptQuestions = questions.map(q => ({
            questionId: q._id,
            status: 'unattempted',
            selectedOption: null,
            isCorrect: false,
            timeTaken: 0
        }));

        // 3. Create Attempt
        const attempt = await TestAttempt.create({
            userId: req.user._id,
            config: {
                subjectId,
                topicIds,
                difficulty,
                questionCount,
                timerMode,
                timeLimit
            },
            questions: attemptQuestions,
            status: 'in_progress',
            startedAt: Date.now()
        });

        res.status(201).json({
            _id: attempt._id,
            config: attempt.config,
            status: attempt.status,
            startedAt: attempt.startedAt,
            questions: attemptQuestions // Return questions immediately for frontend
        });
    } catch (error) {
        console.error('Start Test Error:', error); // Log full error
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit test attempt
// @route   POST /api/tests/:id/submit
// @access  Private
const submitTest = async (req, res) => {
    try {
        const { answers } = req.body; // Array of { questionId, selectedOption, timeTaken, status }
        const attempt = await TestAttempt.findById(req.params.id);

        if (!attempt) {
            return res.status(404).json({ message: 'Test attempt not found' });
        }

        if (attempt.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (attempt.status === 'completed') {
            return res.status(400).json({ message: 'Test already submitted' });
        }

        // Get all original question IDs from the test
        const allQuestionIds = attempt.questions.map(q => q.questionId.toString());

        // Fetch all questions involved
        const questions = await Question.find({ _id: { $in: allQuestionIds } });

        // Map for quick lookup
        const questionMap = {};
        questions.forEach(q => {
            questionMap[q._id.toString()] = q;
        });

        // Create answer map for quick lookup
        const answerMap = {};
        answers.forEach(ans => {
            answerMap[ans.questionId] = ans;
        });

        let correctCount = 0;
        let incorrectCount = 0;
        let skippedCount = 0;
        const processedQuestions = [];



        // Process ALL questions (including unattempted ones)
        for (let qId of allQuestionIds) {
            const question = questionMap[qId];
            if (!question) {
                console.warn(`⚠️ Question ${qId} missing from collection during submission`);
                continue;
            }

            const ans = answerMap[qId];

            if (ans && ans.selectedOption) {
                // Question was attempted
                const isCorrect = ans.selectedOption === question.correctAnswer;
                const status = 'attempted';

                if (isCorrect) correctCount++;
                else incorrectCount++;

                processedQuestions.push({
                    questionId: qId,
                    status,
                    selectedOption: ans.selectedOption,
                    isCorrect,
                    timeTaken: ans.timeTaken || 0,
                    timeRemaining: (ans.timeRemaining !== undefined) ? ans.timeRemaining : null
                });
            } else {
                // Question was not attempted
                skippedCount++;
                processedQuestions.push({
                    questionId: qId,
                    status: 'unattempted',
                    selectedOption: null,
                    isCorrect: false,
                    timeTaken: 0,
                    timeRemaining: null
                });
            }
        }



        attempt.questions = processedQuestions;
        attempt.score = {
            total: correctCount * 3 - incorrectCount * 1, // Example marking scheme: +3, -1
            correct: correctCount,
            incorrect: incorrectCount,
            skipped: skippedCount
        };
        attempt.status = 'completed';
        attempt.completedAt = Date.now();

        await attempt.save();

        res.json({
            _id: attempt._id,
            score: attempt.score,
            status: attempt.status,
            completedAt: attempt.completedAt
        });

    } catch (error) {
        console.error('❌ Submit Test Error:', {
            requestId: req.params.id,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attempt history
// @route   GET /api/tests/history
// @access  Private
const getHistory = async (req, res) => {
    try {
        const attempts = await TestAttempt.find({ userId: req.user._id })
            .sort({ startedAt: -1 })
            .populate('config.subjectId', 'name icon');

        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific attempt details
// @route   GET /api/tests/:id
// @access  Private
const getAttempt = async (req, res) => {
    try {
        const attempt = await TestAttempt.findById(req.params.id)
            .populate('questions.questionId', 'text options correctAnswer solution solution explanation'); // Populate question details for review

        if (!attempt) {
            return res.status(404).json({ message: 'Test attempt not found' });
        }

        if (attempt.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Sanitize if in_progress
        if (attempt.status === 'in_progress') {
            const sanitizedAttempt = attempt.toObject();
            sanitizedAttempt.questions = sanitizedAttempt.questions.map(q => {
                if (q.questionId) {
                    q.questionId.correctAnswer = undefined;
                    q.questionId.solution = undefined;
                    // Also text/options are needed, so keep them
                }
                return q;
            });
            return res.json(sanitizedAttempt);
        }

        res.json(attempt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Retake a completed test with same questions
// @route   POST /api/tests/:id/retake
// @access  Private
const retakeTest = async (req, res) => {
    try {
        const originalAttempt = await TestAttempt.findById(req.params.id);

        if (!originalAttempt) {
            return res.status(404).json({ message: 'Test attempt not found' });
        }

        if (originalAttempt.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Create new attempt with same configuration and questions
        const newAttempt = await TestAttempt.create({
            userId: req.user._id,
            config: originalAttempt.config,
            questions: originalAttempt.questions.map(q => ({
                questionId: q.questionId,
                status: 'unattempted',
                selectedOption: null,
                isCorrect: false,
                timeTaken: 0
            })),
            status: 'in_progress',
            startedAt: Date.now()
        });

        res.status(201).json({
            _id: newAttempt._id,
            config: newAttempt.config,
            status: newAttempt.status,
            startedAt: newAttempt.startedAt,
            questions: newAttempt.questions
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete test attempt
// @route   DELETE /api/tests/:id
// @access  Private
const saveProgress = async (req, res) => {
    try {
        const { answers, timeRemaining, currentQuestionIndex } = req.body;
        const attempt = await TestAttempt.findById(req.params.id);

        if (!attempt) {
            return res.status(404).json({ message: 'Test attempt not found' });
        }

        if (attempt.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (attempt.status === 'completed') {
            return res.status(400).json({ message: 'Test already completed' });
        }

        // Update answers - Use map for speed but update original array to preserve order
        if (answers && Array.isArray(answers)) {
            const answersMap = {};
            answers.forEach(ans => {
                if (ans && ans.questionId) {
                    answersMap[ans.questionId.toString()] = ans;
                }
            });

            attempt.questions.forEach(q => {
                if (!q.questionId) return;
                const qId = q.questionId.toString();
                const ans = answersMap[qId];

                if (ans) {
                    q.selectedOption = ans.selectedOption;
                    q.status = ans.status || 'attempted';
                    q.timeTaken = ans.timeTaken || 0;

                    // Update per-question timeRemaining if provided
                    if (ans.timeRemaining !== undefined) {
                        q.timeRemaining = ans.timeRemaining;
                    }
                }
            });
        }

        if (timeRemaining !== undefined) {
            attempt.timeRemaining = timeRemaining;
        }

        if (currentQuestionIndex !== undefined) {
            attempt.lastQuestionIndex = currentQuestionIndex;
        }

        await attempt.save();
        res.status(200).json({ message: 'Progress saved' });
    } catch (error) {
        console.error('Save Progress Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteAttempt = async (req, res) => {
    try {
        const attempt = await TestAttempt.findById(req.params.id);

        if (!attempt) {
            return res.status(404).json({ message: 'Test attempt not found' });
        }

        if (attempt.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await attempt.deleteOne();
        res.json({ message: 'Test attempt deleted' });

    } catch (error) {
        console.error('Delete Attempt Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    startTest,
    getAttempt,
    submitTest,
    getHistory,
    retakeTest,
    deleteAttempt,
    saveProgress
};
