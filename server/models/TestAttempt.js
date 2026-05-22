const mongoose = require('mongoose');

const AttemptQuestionSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    status: {
        type: String,
        enum: ['unattempted', 'attempted', 'skipped', 'marked_for_review'],
        default: 'unattempted'
    },
    selectedOption: {
        type: String,
        default: null
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    timeTaken: {
        type: Number, // in seconds
        default: 0
    },
    timeRemaining: {
        type: Number, // in seconds, specifically for per_question mode
        default: null
    }
});

const TestAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'aborted'],
        default: 'in_progress'
    },
    config: {
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        topicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
        difficulty: { type: String }, // 'mixed', 'easy', 'medium', 'hard'
        questionCount: { type: Number },
        timerMode: { type: String, enum: ['overall', 'per_question'] },
        timeLimit: { type: Number } // Total minutes or per question minutes
    },
    questions: [AttemptQuestionSchema],
    score: {
        total: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 }
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    timeRemaining: {
        type: Number, // in seconds, tracks remaining time when last active
        default: null
    },
    lastQuestionIndex: {
        type: Number,
        default: 0
    }
});

// Index to find active tests
TestAttemptSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('TestAttempt', TestAttemptSchema);
