const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Your multer config
const studentSubmissionController = require('../controllers/studentSubmission.controller');

// POST /api/assignments/:assignmentDefId/submit
router.post(
    '/:assignmentDefId/submit',
    authMiddleware,
    upload.single('submissionFile'), // 'submissionFile' is the field name from form
    studentSubmissionController.submitAssignment
);
router.get('/submissions/me', authMiddleware, studentSubmissionController.getMySubmissions);

// ... other student submission routes
module.exports = router;