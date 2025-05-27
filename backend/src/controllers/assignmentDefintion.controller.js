// controllers/assignmentDefinition.controller.js
const assignmentDefinitionService = require('../services/assignmentDefinition.service');

// POST /api/assignments/ (Instructor creates)
exports.createAssignmentDefinition = async (req, res) => {
    try {
        const { title, description, dueDate, pointsPossible, courseId } = req.body; // courseId from body
        const instructorId = req.user.id;

        if (!title || !description || !dueDate || !courseId) {
            return res.status(400).json({ error: 'Title, description, dueDate, and courseId are required.' });
        }
        if (req.user.role !== 'instructor') {
            return res.status(403).json({ error: 'Forbidden: Only instructors can create assignments.' });
        }

        const assignmentData = { title, description, course: courseId, instructor: instructorId, dueDate, pointsPossible };
        const newAssignment = await assignmentDefinitionService.create(assignmentData);
        res.status(201).json(newAssignment);
    } catch (error){
        console.error("Error creating assignment:", error);
        res.status(500).json({ error: error.message || 'Failed to create assignment definition.' });
    }
};

// GET /api/assignments/:definitionId (Instructor or Student views specific definition)
exports.getAssignmentDefinitionById = async (req, res) => {
    try {
        const { definitionId } = req.params;
        const assignment = await assignmentDefinitionService.getById(definitionId);

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment definition not found.' });
        }
        // Basic access: any authenticated user can see a definition by ID.
        // More granular access (e.g., student enrolled in the course) would require an enrollment check here.
        // Since we don't have enrollment service, we'll allow if found.
        res.json(assignment);
    } catch (error) {
        console.error("Error fetching assignment definition by ID:", error);
        if (error.message && error.message.includes('Invalid Definition ID format')) { // Check if error.message exists
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: (error.message || 'Failed to fetch assignment definition.') });
    }
};

// GET /api/assignments/ (General GET for ALL users to list definitions)
exports.getAllAssignmentDefinitions = async (req, res) => {
    try {
        let definitions;
        const filter = {}; // Start with an empty filter

        if (req.user.role === 'instructor') {
            // Instructors see assignments they created
            filter.instructor = req.user.id;
            definitions = await assignmentDefinitionService.getAll(filter);
        } else if (req.user.role === 'student') {
            // Students see ALL available assignment definitions.
            // The frontend will handle displaying which ones they've submitted to.
            definitions = await assignmentDefinitionService.getAll(); // No filter, gets all
        } else {
            // For other roles or unhandled cases, perhaps return empty or an error
            return res.status(403).json({ error: 'Forbidden: Your role cannot list assignments this way.' });
        }
        res.json(definitions);
    } catch (error) {
        console.error("Error fetching all assignment definitions:", error);
        res.status(500).json({ error: error.message || 'Failed to fetch assignment definitions.' });
    }
};


// PUT /api/assignments/:definitionId (Instructor updates)
exports.updateAssignmentDefinition = async (req, res) => {
    try {
        const { definitionId } = req.params;
        const updateData = req.body;
        const instructorId = req.user.id;

        if (req.user.role !== 'instructor') {
            return res.status(403).json({ error: 'Forbidden: Only instructors can update assignments.' });
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No update data provided.' });
        }

        const updatedAssignment = await assignmentDefinitionService.update(definitionId, updateData, instructorId);

        // The service now returns null if not found/not authorized, or throws specific errors
        if (!updatedAssignment) { // This case might not be hit if service throws for not found/forbidden
            return res.status(404).json({ error: 'Assignment definition not found.' });
        }
        res.json(updatedAssignment);
    } catch (error){
        console.error("Error updating assignment definition:", error);
        if (error.statusCode === 403) {
            return res.status(403).json({ error: error.message });
        }
        if (error.statusCode === 404) { // If service throws specific not found
             return res.status(404).json({ error: error.message });
        }
        if (error.statusCode === 400 || (error.message && error.message.includes('Invalid Definition ID format'))) {
            return res.status(400).json({ error: error.message || 'Invalid input.' });
        }
        res.status(500).json({ error: error.message || 'Failed to update assignment definition.' });
    }
};

// DELETE /api/assignments/:definitionId (Instructor deletes)
exports.deleteAssignmentDefinition = async (req, res) => {
    try {
        const { definitionId } = req.params;
        const instructorId = req.user.id;

        if (req.user.role !== 'instructor') {
            return res.status(403).json({ error: 'Forbidden: Only instructors can delete assignments.' });
        }

        const result = await assignmentDefinitionService.delete(definitionId, instructorId);

        // Service now returns null or throws specific errors
        if (!result && !(await assignmentDefinitionService.getById(definitionId))) { // Double check if it existed before trying to delete
            return res.status(404).json({ error: 'Assignment definition not found.' });
        }
        // If result is null but it existed, it means it was not deleted (likely due to auth in service but service throws for that)
        // If service throws for auth, it's caught below. If it returns null because it *was* found but couldn't delete (other reason), this logic is fine.
        // If service successfully deletes, `result` is the deleted doc.

        res.json({ message: 'Assignment definition deleted successfully.' });
    } catch (error) {
        console.error("Error deleting assignment definition:", error);
        if (error.statusCode === 403) {
            return res.status(403).json({ error: error.message });
        }
        if (error.statusCode === 404) {
            return res.status(404).json({ error: error.message });
        }
        if (error.statusCode === 400 || (error.message && error.message.includes('Invalid Definition ID format'))) {
            return res.status(400).json({ error: error.message || 'Invalid input.' });
        }
        res.status(500).json({ error: error.message || 'Failed to delete assignment definition.' });
    }
};