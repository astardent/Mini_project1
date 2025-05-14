const StudentSubmission = require('../models/studentSubmission.model');

exports.create = async (data) => {
    const submission = new StudentSubmission(data);
    return await submission.save();
};

exports.findByStudentAndAssignment = async (studentId, assignmentDefId) => {
    return await StudentSubmission.findOne({ student: studentId, assignmentDefinition: assignmentDefId });
};
exports.getSubmissionsByStudent = async (studentId) => {
    return await StudentSubmission.find({ student: studentId })
        .populate('assignmentDefinition', 'title pointsPossible') // Populate with assignment title and points
        .populate('course', 'title') // Populate with course title
        .sort({ submissionDate: -1 }); // Show most recent first
};
// ... other service methods