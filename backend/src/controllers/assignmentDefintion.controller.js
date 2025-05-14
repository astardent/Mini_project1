const assignmentDefinitionService = require('../services/assignmentDefinition.service');

exports.createAssignmentDefinition = async (req, res) => {
    try {
        const { title, description, dueDate, pointsPossible } = req.body;
        const courseId = req.params.courseId; // Or from req.body if not in URL
        const instructorId = req.user.id; // From authMiddleware

        if (!title || !description || !dueDate || !courseId) {
            return res.status(400).json({ error: 'Title, description, dueDate, and course are required.' });
        }
        if (req.user.role !== 'instructor') { // Basic role check
            return res.status(403).json({ error: 'Only instructors can create assignments.' });
        }

        const assignmentData = { title, description, course: courseId, instructor: instructorId, dueDate, pointsPossible };
        const newAssignment = await assignmentDefinitionService.create(assignmentData);
        res.status(201).json(newAssignment);
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ error: error.message || 'Failed to create assignment.' });
    }
};