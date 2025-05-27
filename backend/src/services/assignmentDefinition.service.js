// services/assignmentDefinition.service.js
const AssignmentDefinition = require('../models/assignmentDefinition.model'); // Ensure path is correct
const mongoose = require('mongoose');


exports.create = async (data) => {
    const assignment = new AssignmentDefinition(data);
    return await assignment.save();
};

exports.getAll = async (filter = {}) => {
    return await AssignmentDefinition.find(filter)
        .populate('course', 'coursename coursecode') // Use actual field names
        .populate('instructor', 'name email')
        .sort({ dueDate: 1 });
};
exports.getById = async (definitionId) => {
    // 1. Validate if the provided ID is a valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(definitionId)) {
        // Optionally, you could throw an error here for the controller to catch
        // throw new Error('Invalid Definition ID format');
        console.warn(`Invalid ObjectId format for definitionId: ${definitionId}`);
        return null; // Or handle as an error in the controller
    }

    // 2. Use findById to retrieve the document
    try {
        const assignmentDefinition = await AssignmentDefinition.findById(definitionId)
            .populate('course', 'coursename coursecode') // Populate with actual course field names
            .populate('instructor', 'name email');     // Populate instructor details

        return assignmentDefinition; // This will be the document or null if not found
    } catch (error) {
        // Log the error for debugging, but let the controller handle the HTTP response
        console.error(`Error fetching AssignmentDefinition by ID ${definitionId}:`, error);
        // You might re-throw if you want the controller to always expect an error object
        // throw error;
        return null; // Or indicate an error occurred
    }
};
exports.getDefinitionsByCourseIds = async (courseIds) => {
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
        return [];
    }
    const validCourseIds = courseIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validCourseIds.length === 0) {
        return [];
    }
    return await AssignmentDefinition.find({ course: { $in: validCourseIds } })
        .populate('course', 'coursename coursecode') // Use actual field names
        .populate('instructor', 'name email')
        .sort({ dueDate: 1 });
};


exports.update = async (definitionId, updateData, instructorId) => {
    if (!mongoose.Types.ObjectId.isValid(definitionId)) {
        throw new Error('Invalid Definition ID format');
    }
    const assignment = await AssignmentDefinition.findById(definitionId);

    if (!assignment) {
        return null; // Or throw an error
    }

    // Authorization: Ensure the instructor trying to update is the one who created it
    if (assignment.instructor.toString() !== instructorId) {
        const error = new Error('Forbidden: You are not authorized to update this assignment definition.');
        error.statusCode = 403;
        throw error;
    }

    // Update fields
    if (updateData.title) assignment.title = updateData.title;
    if (updateData.description) assignment.description = updateData.description;
    if (updateData.dueDate) assignment.dueDate = updateData.dueDate;
    if (updateData.pointsPossible !== undefined) assignment.pointsPossible = updateData.pointsPossible;
    // if (updateData.course) assignment.course = updateData.course; // Be careful allowing course changes

    assignment.updatedAt = Date.now();
    return await assignment.save();
};

exports.delete = async (definitionId, instructorId) => {
    if (!mongoose.Types.ObjectId.isValid(definitionId)) {
        throw new Error('Invalid Definition ID format');
    }
    const assignment = await AssignmentDefinition.findById(definitionId);

    if (!assignment) {
        return null; // Or throw an error: const error = new Error('Assignment definition not found'); error.statusCode = 404; throw error;
    }

    // Authorization: Ensure the instructor trying to delete is the one who created it
    if (assignment.instructor.toString() !== instructorId) {
        const error = new Error('Forbidden: You are not authorized to delete this assignment definition.');
        error.statusCode = 403;
        throw error;
    }

    // TODO: Consider what happens to student submissions if an assignment definition is deleted.
    // Option 1: Delete all associated StudentSubmissions (cascade delete - needs careful implementation).
    // Option 2: Prevent deletion if submissions exist.
    // Option 3: Mark as "archived" instead of hard delete.
    // For now, direct delete:
    return await AssignmentDefinition.findByIdAndDelete(definitionId);
};