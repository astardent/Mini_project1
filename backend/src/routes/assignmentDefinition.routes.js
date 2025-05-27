// routes/assignmentDefinition.routes.js (RENAMED and REVISED)
const express = require('express');
const router = express.Router();
const assignmentDefinitionController = require('../controllers/assignmentDefintion.controller'); // Assuming instructor controller
const authMiddleware = require('../middlewares/authMiddleware');
// Multer (upload) is NOT needed here if instructors are just creating definitions with text.
// If instructors can attach files to the definition itself, then multer would be needed.

// GET all assignment definitions (e.g., for a course, or all for an instructor)
// This route needs to be more specific (e.g., /courses/:courseId/assignments or /instructor/assignments)
// For now, let's assume it's a general GET that the controller filters.

router.get('/', authMiddleware, assignmentDefinitionController.getAllAssignmentDefinitions);

// POST a new assignment definition (instructor action)
// The controller you provided (createAssignmentDefinition) expects courseId in params or body.
// If it's /api/courses/:courseId/assignments, then this file would be mounted under a course route.
// If it's /api/instructor/assignments, then courseId must be in req.body.
// Let's assume a general POST route and the controller handles where courseId comes from.
router.post(
    '/', // Path becomes /api/assignments/
    authMiddleware,
    // Ensure only instructors can call this in the controller
    assignmentDefinitionController.createAssignmentDefinition // This controller expects courseId
);

// PUT update an assignment definition (instructor action)
router.put(
    '/:definitionId', // Path becomes /api/assignments/:definitionId
    authMiddleware,
    // Ensure only instructors can call this
    assignmentDefinitionController.updateAssignmentDefinition
);

// DELETE an assignment definition (instructor action)
router.delete(
    '/:definitionId', // Path becomes /api/assignments/:definitionId
    authMiddleware,
    // Ensure only instructors can call this
    assignmentDefinitionController.deleteAssignmentDefinition
);

// GET a specific assignment definition
router.get(
    '/:definitionId',
    authMiddleware,
    assignmentDefinitionController.getAssignmentDefinitionById
);


module.exports = router;