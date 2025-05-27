// routes/studentSubmission.routes.js
const express = require('express');
const router = express.Router();
const studentSubmissionController = require('../controllers/studentSubmission.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const StudentSubmission = require('../models/studentSubmission.model');
const fs = require('fs');
const path = require('path');

// STUDENT: Submit to an assignment definition
// POST /api/assignments/:assignmentDefId/submit
router.post('/:assignmentDefId/submit',
    authMiddleware,
    (req, res, next) => { // <<< TEMPORARY DEBUG MIDDLEWARE
        console.log("-----------------------------------------------------");
        console.log("[Debug Middleware] Reached before Multer for /:assignmentDefId/submit. Path:", req.path);
        console.log("[Debug Middleware] req.headers['content-type']:", req.headers['content-type']);
        console.log("-----------------------------------------------------");
        next();
    },
    upload.single('submissionFile'),
    studentSubmissionController.submitAssignment
);

// STUDENT: Get ALL their own submissions
// GET /api/assignments/submissions/me  <-- NEW ROUTE
router.get('/submissions/me', // This path is relative to where studentSubmissionRoutes is mounted
    authMiddleware,
    studentSubmissionController.getMySubmissions // This controller function already exists
);

// STUDENT: Get their own submission for a specific assignment definition (optional)
// GET /api/assignments/:assignmentDefId/my-submission  <-- This was slightly different
// router.get('/:assignmentDefId/my-submissions', // Note the 's'
//     authMiddleware,
//     studentSubmissionController.getMySubmissionForAssignmentDef // Needs a new controller for this specific one
// );

// INSTRUCTOR: Get all submissions for a specific assignment definition
// GET /api/assignments/:assignmentDefId/submissions
router.get('/:assignmentDefId/submissions',
    authMiddleware,
    studentSubmissionController.getSubmissionsForAssignment
);

// INSTRUCTOR: Grade a specific student submission
// PUT /api/assignments/submissions/:submissionId/grade
router.put('/submissions/:submissionId/grade',
    authMiddleware,
    studentSubmissionController.gradeSubmission
);

// USER (Student/Authorized Instructor): Download a submission file
// GET /api/assignments/submissions/:submissionId/download
router.get('/submissions/:submissionId/download', authMiddleware, async (req, res) => {
    // ... (Your existing download logic is good) ...
    try {
        const submission = await StudentSubmission.findById(req.params.submissionId)
                                        .populate('student', 'id role name email') // Added name and email for student
                                        .populate({
                                            path: 'assignmentDefinition',
                                            populate: [{ path: 'course', select: 'title code' }, {path: 'instructor', select: 'name'}] // Select specific fields
                                        });

        if (!submission || !submission.submittedFile || !submission.submittedFile.path) {
            return res.status(404).send('File not found or submission invalid.');
        }

        let canDownload = false;
        if (req.user.role === 'student' && submission.student._id.toString() === req.user.id) {
            canDownload = true;
        } else if (req.user.role === 'instructor') {
            if (submission.assignmentDefinition && submission.assignmentDefinition.instructor &&
                submission.assignmentDefinition.instructor._id.toString() === req.user.id) {
                 canDownload = true;
            }
        }

        if (!canDownload) {
             return res.status(403).send('Forbidden: You cannot access this file.');
        }

        const filePath = path.resolve(submission.submittedFile.path);

        if (fs.existsSync(filePath)) {
            res.download(filePath, submission.submittedFile.originalName);
        } else {
            console.warn(`File not found on server at path: ${filePath} for submission ID: ${submission._id}`);
            res.status(404).send('File not found on server.');
        }
    } catch (error) {
        console.error('Error processing download for submission:', error);
        res.status(500).send('Server error during file download.');
    }
});

module.exports = router;