const studentSubmissionService = require('../services/studentSubmission.service');
const assignmentDefinitionService = require('../services/assignmentDefinition.service'); // To get due date

exports.submitAssignment = async (req, res) => {
    try {
        const assignmentDefId = req.params.assignmentDefId;
        const studentId = req.user.id;
        const { submissionText } = req.body;
        const fileData = req.file; // From multer

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can submit assignments.' });
        }
        if (!submissionText && !fileData) {
            return res.status(400).json({ error: 'Submission must include text or a file.' });
        }

        const assignmentDef = await assignmentDefinitionService.getById(assignmentDefId);
        if (!assignmentDef) {
            return res.status(404).json({ error: 'Assignment definition not found.' });
        }

        // Check if already submitted (service can handle this with unique index too)
        const existingSubmission = await studentSubmissionService.findByStudentAndAssignment(studentId, assignmentDefId);
        if (existingSubmission) {
            // Decide on re-submission policy: allow update or deny
            return res.status(409).json({ error: 'You have already submitted this assignment.' });
        }


        const submissionData = {
            assignmentDefinition: assignmentDefId,
            student: studentId,
            course: assignmentDef.course, // Get course from assignment definition
            submissionText,
            submittedFile: fileData ? {
                originalName: fileData.originalname,
                mimetype: fileData.mimetype,
                filename: fileData.filename,
                path: fileData.path,
                size: fileData.size
            } : null,
            isLate: new Date() > new Date(assignmentDef.dueDate) // Basic late check
        };

        const newSubmission = await studentSubmissionService.create(submissionData);
        res.status(201).json(newSubmission);
    } catch (error) {
        console.error("Error submitting assignment:", error);
        // Handle specific errors like unique constraint violation if already submitted
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(409).json({ error: 'You have already submitted this assignment.' });
        }
        res.status(500).json({ error: error.message || 'Failed to submit assignment.' });
    }
};
exports.getMySubmissions = async (req, res) => {
    try {
        const studentId = req.user.id; // From authMiddleware
        if (!studentId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        const submissions = await studentSubmissionService.getSubmissionsByStudent(studentId);
        res.json(submissions);
    } catch (error) {
        console.error('Error fetching student submissions:', error);
        res.status(500).json({ error: 'Failed to retrieve submissions.' });
    }
};