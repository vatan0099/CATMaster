const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    id: { type: String, required: true }, // e.g., "a", "b", "c", "d"
    text: { type: String, required: true }
});

const QuestionSchema = new mongoose.Schema({
    text: {
        type: String, // Can store HTML/Markdown string
        required: true
    },
    options: [OptionSchema],
    correctAnswer: {
        type: String, // Matches Option ID
        required: true
    },
    solution: {
        type: String, // Explanation
        default: ''
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
        index: true
    },
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true,
        index: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
        index: true
    },
    tags: [{
        type: String,
        index: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
});

// Random fetching optimization often requires numeric indexing or aggregation sample
// We will use aggregation $sample, but for large datasets, we might need random fields.
// For now, standard indexing on topic+difficulty is sufficient.

module.exports = mongoose.model('Question', QuestionSchema);
