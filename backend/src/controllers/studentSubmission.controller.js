// controllers/studentSubmission.controller.js
const studentSubmissionService = require('../services/studentSubmission.service');
const assignmentDefinitionService = require('../services/assignmentDefinition.service');

// Student submits an assignment
exports.submitAssignment = async (req, res) => {
    // ... (your existing submitAssignment logic is mostly fine)
    // Ensure you are getting course from assignmentDef correctly:
    // const assignmentDef = await assignmentDefinitionService.getById(assignmentDefId);
    // ...
    // course: assignmentDef.course._id || assignmentDef.course,
    // ...
     console.log("-----------------------------------------------------");
    console.log("[Controller submitAssignment] Handler reached.");
    console.log("[Controller submitAssignment] req.params:", req.params);
    console.log("[Controller submitAssignment] req.user (from auth):", req.user);
    console.log("[Controller submitAssignment] req.body (text fields from FormData):", req.body);
    console.log("[Controller submitAssignment] req.file (from Multer):", req.file); // <<< THIS IS THE MOST IMPORTANT LOG
    console.log("-----------------------------------------------------");
     try {
         const assignmentDefId = req.params.assignmentDefId;
         const studentId = req.user.id;
         const { submissionText } = req.body;
         const fileDataFromMulter = req.file;
        console.log("[Controller] req.body:", req.body); // DEBUG: See what text fields arrive
        console.log("[Controller] req.file (from Multer):", fileDataFromMulter); // <<< CRITICAL DEBUG LOG
         if (req.user.role !== 'student') {
             return res.status(403).json({ error: 'Only students can submit assignments.' });
         }
         if (!submissionText && !fileDataFromMulter) {
             return res.status(400).json({ error: 'Submission must include text or a file.' });
         }

         const assignmentDef = await assignmentDefinitionService.getById(assignmentDefId);
         if (!assignmentDef) {
             return res.status(404).json({ error: 'Assignment definition not found.' });
         }

         const existingSubmission = await studentSubmissionService.findByStudentAndAssignment(studentId, assignmentDefId);
         if (existingSubmission) {
             return res.status(409).json({ error: 'You have already submitted this assignment. Re-submission not yet supported.' });
         }

         const submissionData = {
             assignmentDefinition: assignmentDefId,
             student: studentId,
             course: assignmentDef.course._id || assignmentDef.course, // Get course from assignment definition
             submissionText,
             submittedFile: fileDataFromMulter ? {
            originalName: fileDataFromMulter.originalname,
            mimetype: fileDataFromMulter.mimetype,
            filename: fileDataFromMulter.filename,
            path: fileDataFromMulter.path,
            size: fileDataFromMulter.size
        } : null, // This logic is correct for setting to null if req.file is undefined
             isLate: new Date() > new Date(assignmentDef.dueDate)
         };

         const newSubmission = await studentSubmissionService.create(submissionData);
         res.status(201).json(newSubmission);
     } catch (error) {
         console.error("Error submitting assignment:", error);
         if (error.code === 11000) {
             return res.status(409).json({ error: 'You have already submitted this assignment.' });
         }
         res.status(500).json({ error: error.message || 'Failed to submit assignment.' });
     }
};

// Student gets their own submissions
exports.getMySubmissions = async (req, res) => {
    try {
        const studentId = req.user.id;
        if (!studentId) return res.status(401).json({ error: 'User not authenticated.' });
        const submissions = await studentSubmissionService.getSubmissionsByStudent(studentId);
        res.json(submissions || []);
    } catch (error) {
        console.error('Error fetching student submissions:', error);
        res.status(500).json({ error: 'Failed to retrieve submissions.' });
    }
};

// Instructor: Get all submissions for a specific Assignment Definition
exports.getSubmissionsForAssignment = async (req, res) => {
    try {
        const { assignmentDefId } = req.params;
        const instructorId = req.user.id;

        if (req.user.role !== 'instructor') {
            return res.status(403).json({ error: 'Forbidden: Only instructors can view submissions.' });
        }
        // Optional: Further check if this instructor owns the assignment definition
        const assignmentDef = await assignmentDefinitionService.getById(assignmentDefId);
        if (!assignmentDef || assignmentDef.instructor._id.toString() !== instructorId) {
             return res.status(403).json({ error: 'Forbidden: You are not authorized to view submissions for this assignment.' });
        }

        const submissions = await studentSubmissionService.getSubmissionsByAssignmentDefinition(assignmentDefId);
        res.json(submissions || []);
    } catch (error) {
        console.error('Error fetching submissions for assignment:', error);
        res.status(500).json({ error: 'Failed to retrieve submissions.' });
    }
};

// Instructor: Grade a submission
exports.gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;
        const instructorId = req.user.id;

        if (req.user.role !== 'instructor') {
            return res.status(403).json({ error: 'Forbidden: Only instructors can grade assignments.' });
        }
        if (grade === undefined || feedback === undefined) {
            return res.status(400).json({ error: 'Grade and feedback are required.' });
        }

        const updatedSubmission = await studentSubmissionService.gradeSubmission(submissionId, grade, feedback, instructorId);
        res.json(updatedSubmission);
    } catch (error) {
        console.error('Error grading submission:', error);
        if (error.statusCode === 403 || error.statusCode === 404) {
             return res.status(error.statusCode).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to grade submission.' });
    }
};