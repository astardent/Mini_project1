// services/studentSubmission.service.js
const StudentSubmission = require('../models/studentSubmission.model');
const mongoose = require('mongoose');

exports.create = async (data) => {
    console.log("-----------------------------------------------------");
    console.log("[Service createSubmission] Data received:", JSON.stringify(data, null, 2)); // Log the full data object
    console.log("[Service createSubmission] submittedFile part of data:", data.submittedFile);
    console.log("-----------------------------------------------------");
    const submission = new StudentSubmission(data);
    return await submission.save();
};

exports.findByStudentAndAssignment = async (studentId, assignmentDefId) => {
    return await StudentSubmission.findOne({ student: studentId, assignmentDefinition: assignmentDefId });
};

exports.getSubmissionsByStudent = async (studentId) => {
    return await StudentSubmission.find({ student: studentId })
        .populate('assignmentDefinition', 'title pointsPossible')
        .populate('course', 'title code')
        .sort({ submissionDate: -1 });
};

exports.getSubmissionById = async (submissionId) => { // Added for grading/viewing specific submission
     if (!mongoose.Types.ObjectId.isValid(submissionId)) return null;
     return await StudentSubmission.findById(submissionId)
         .populate('student', 'name email')
         .populate('assignmentDefinition', 'title pointsPossible')
         .populate('course', 'title code');
};

// For Instructor: Get all submissions for a specific Assignment Definition
exports.getSubmissionsByAssignmentDefinition = async (assignmentDefId) => {
    if (!mongoose.Types.ObjectId.isValid(assignmentDefId)) return [];
    return await StudentSubmission.find({ assignmentDefinition: assignmentDefId })
        .populate('student', 'name email') // So instructor sees who submitted
        .populate('assignmentDefinition', 'title') // For context
        .populate('course', 'title')
        .sort({ submissionDate: 1 }); // Or by student name
};

// For Instructor: Grade a submission
exports.gradeSubmission = async (submissionId, grade, feedback, instructorId) => {
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
        throw new Error('Invalid Submission ID format');
    }
    const submission = await StudentSubmission.findById(submissionId).populate('assignmentDefinition');
    if (!submission) {
        throw new Error('Submission not found.');
    }

    // Authorization: Ensure this instructor is the one who created the assignment definition
    if (submission.assignmentDefinition.instructor.toString() !== instructorId) {
        const error = new Error('Forbidden: You are not authorized to grade this submission.');
        error.statusCode = 403;
        throw error;
    }

    submission.grade = grade;
    submission.instructorFeedback = feedback;
    // submission.gradedBy = instructorId; // Optional: if you want to track who graded
    // submission.gradedDate = Date.now(); // Optional
    return await submission.save();
};