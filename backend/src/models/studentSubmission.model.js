// models/studentSubmission.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSubmissionSchema = new Schema({
    assignmentDefinition: { type: Schema.Types.ObjectId, ref: 'AssignmentDefinition', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true }, // Denormalized for easier querying
    submissionText: { type: String }, // For text-based submissions
    submittedFile: { // For file-based submissions
        originalName: String,
        mimetype: String,
        filename: String, // Name of the file as stored on the server
        path: String,     // Path to the file on the server
        size: Number
    },
    submissionDate: { type: Date, default: Date.now },
    grade: { type: Number },
    instructorFeedback: { type: String },
    isLate: { type: Boolean, default: false } // Can be calculated on submission
});

// Ensure a student can only submit once per assignment definition
studentSubmissionSchema.index({ assignmentDefinition: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('StudentSubmission', studentSubmissionSchema);