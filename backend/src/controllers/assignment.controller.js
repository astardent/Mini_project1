// controllers/assignment.controller.js
const AssignmentService = require('../services/assignment.service');

exports.getAllAssignments = async (req, res) => {
    try {
        // Example: Get assignments for the logged-in student (from authMiddleware)
        // const studentId = req.user.id;
        // const assignments = await AssignmentService.getAssignmentsByStudent(studentId);

        // For now, a generic get all (adapt as needed)
        const assignments = await AssignmentService.getAllAssignments();
        res.json(assignments);
    } catch (err) {
        console.error("Error getting assignments:", err);
        res.status(500).json({ error: "Failed to retrieve assignments" });
    }
};

exports.addAssignment = async (req, res) => {
    try {
        // req.file is populated by multer if a single file is uploaded with fieldname 'assignmentFile'
        if (!req.file) {
            return res.status(400).json({ error: "No assignment file uploaded." });
        }

        // Other data comes from req.body (e.g., title, description, courseId)
        // The student ID should come from the authenticated user
        const studentId = req.user.id; // Assuming authMiddleware adds req.user
        if (!studentId) {
             return res.status(401).json({ error: "User not authenticated for submission." });
        }

        const { title, description, courseId /* other fields */ } = req.body;

        if (!title || !courseId) {
            return res.status(400).json({ error: "Title and Course ID are required." });
        }

        const submissionData = { title, description, courseId, studentId };
        const fileData = req.file; // Contains originalname, filename, path, mimetype, size

        const assignment = await AssignmentService.addAssignment(submissionData, fileData);
        res.status(201).json({ msg: "Assignment submitted successfully", assignment });

    } catch (err) {
        console.error("Error submitting assignment:", err);
        res.status(500).json({ error: err.message || "Failed to submit Assignment" });
    }
};

// Update and Delete controllers would also need similar adjustments
// For update, you'd use upload.single('newAssignmentFile') if allowing file replacement
exports.updateAssignment = async (req, res) => {
    try {
        const submissionId = req.params.id; // Assuming ID comes from URL parameter
        const studentId = req.user.id;
        // Check if the submission belongs to the student trying to update it (authorization)

        const { title, description } = req.body;
        const updateData = { title, description };
        const newFileData = req.file; // If a new file is uploaded

        const assignment = await AssignmentService.updateAssignment(submissionId, updateData, newFileData);
        if (!assignment) return res.status(404).json({ error: "Assignment not found" });
        res.json({ msg: "Assignment updated", assignment });
    } catch (err) {
        console.error("Error updating assignment:", err.message);
        res.status(500).json({ error: "Failed to update assignment" });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const submissionId = req.params.id; // Assuming ID comes from URL parameter
        const studentId = req.user.id;
        // Check if the submission belongs to the student trying to delete it (authorization)

        const result = await AssignmentService.deleteAssignment(submissionId);
        if (!result) return res.status(404).json({ error: "Assignment not found" });
        res.json({ msg: "Assignment deleted successfully" });
    } catch (err) {
        console.error("Error deleting assignment:", err.message);
        res.status(500).json({ error: "Failed to delete assignment" });
    }
};