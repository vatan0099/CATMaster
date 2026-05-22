const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
        index: true
    },
    parentTopicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        default: null,
        index: true
    },
    level: {
        type: Number,
        default: 0 // 0 = Root, 1 = Subtopic, etc.
    }
});

// Compound index for unique topic names within a subject/parent
TopicSchema.index({ name: 1, subjectId: 1, parentTopicId: 1 }, { unique: true });

module.exports = mongoose.model('Topic', TopicSchema);
