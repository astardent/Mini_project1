// models/assignmentDefinition.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignmentDefinitionSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'Instructor', required: true },
    dueDate: { type: Date, required: true },
    pointsPossible: { type: Number, default: 100 },
    // Optional: attachments by instructor (e.g., a PDF prompt)
    // instructorAttachments: [{ originalName: String, path: String, mimetype: String, size: Number }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('AssignmentDefinition', assignmentDefinitionSchema);