const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'coming_soon', 'disabled'],
        default: 'coming_soon'
    },
    icon: {
        type: String, // Store icon name (e.g., from Lucide) or URL
        default: 'BookOpen'
    },
    order: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Subject', SubjectSchema);
