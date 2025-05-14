// services/assignment.service.js
const AssignmentSubmission = require('../models/assignmentDefinition.model'); // Ensure model name is correct

exports.getAllAssignments = async () => {
    // This likely needs to be more specific, e.g., get assignments for a student or course
    return await AssignmentSubmission.find({}).populate('course').populate('student', 'name email');
};

// This function now handles adding an assignment submission with a file
exports.addAssignment = async (submissionData, fileData) => {
    const { title, description, courseId, studentId /*, dueDate (if applicable) */ } = submissionData;

    if (!fileData) {
        throw new Error("No file uploaded for the assignment submission.");
    }

    const newSubmission = new AssignmentSubmission({
        title,
        description,
        course: courseId,
        student: studentId,
        // dueDate, (if you have a concept of an 'original assignment' with a due date)
        submittedFile: {
            originalName: fileData.originalname,
            mimetype: fileData.mimetype,
            filename: fileData.filename, // filename as stored by multer
            path: fileData.path,         // path as stored by multer
            size: fileData.size
        }
    });
    return await newSubmission.save();
};

// Update might involve changing text fields or replacing the file (more complex)
exports.updateAssignment = async (submissionId, updateData, newFileData) => {
    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
        throw new Error("Submission not found");
    }

    if (updateData.title) submission.title = updateData.title;
    if (updateData.description) submission.description = updateData.description;
    // Add other updatable fields

    if (newFileData) {
        // TODO: Delete the old file from the filesystem if replacing
        // This needs careful implementation (e.g., using fs.unlink)
        // For now, just updating the metadata
        submission.submittedFile = {
            originalName: newFileData.originalname,
            mimetype: newFileData.mimetype,
            filename: newFileData.filename,
            path: newFileData.path,
            size: newFileData.size
        };
    }
    return await submission.save();
};

// Delete should also remove the file from the filesystem
exports.deleteAssignment = async (submissionId) => {
    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
        throw new Error("Submission not found");
    }

    // TODO: Delete the associated file from the filesystem (e.g., fs.unlink(submission.submittedFile.path))
    // This needs careful error handling

    return await AssignmentSubmission.findByIdAndDelete(submissionId);
};