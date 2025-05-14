// routes/assignment.routes.js
const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/assignment.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Import multer config
const fs = require('fs');
const path = require('path');
router.get('/', authMiddleware, AssignmentController.getAllAssignments);

// Use multer middleware for the 'addAssignment' route
// 'assignmentFile' should be the name attribute of your file input field in the HTML form
router.post(
    '/addassignment',
    authMiddleware,
    upload.single('assignmentFile'), // Process a single file upload with fieldname 'assignmentFile'
    AssignmentController.addAssignment
);

// For updating, if you allow replacing the file:
router.put(
    '/updateassignment/:id', // Use route params for ID
    authMiddleware,
    upload.single('newAssignmentFile'), // Use a different field name or handle carefully
    AssignmentController.updateAssignment
);

router.delete(
    '/deleteassignment/:id', // Use route params for ID
    authMiddleware,
    AssignmentController.deleteAssignment
);
router.get('/:submissionId/download', authMiddleware, async (req, res) => {
    try {
        const submission = await AssignmentSubmission.findById(req.params.submissionId); // Use your service
        if (!submission || !submission.submittedFile || !submission.submittedFile.path) {
            return res.status(404).send('File not found.');
        }
        // Authorization: Check if req.user.id is allowed to download this file
        if (req.user.role === 'student' && submission.student.toString() !== req.user.id) {
             return res.status(403).send('Forbidden: You cannot access this file.');
        }
        // For instructors, you might check if they teach the course associated with the submission.

        const filePath = path.resolve(submission.submittedFile.path); // Use absolute path

        if (fs.existsSync(filePath)) {
            res.download(filePath, submission.submittedFile.originalName, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    // Avoid sending error details if headers already sent
                    if (!res.headersSent) {
                        res.status(500).send('Could not download the file.');
                    }
                }
            });
        } else {
            res.status(404).send('File not found on server.');
        }
    } catch (error) {
        console.error('Error processing download:', error);
        res.status(500).send('Server error during file download.');
    }
});
module.exports = router;