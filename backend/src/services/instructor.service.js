// services/instructor.service.js
const Instructor = require('../models/instructor.model'); // Ensure path is correct
const bcrypt = require('bcryptjs'); // Import bcryptjs

/**
 * Retrieves all instructors.
 * @returns {Promise<Array<object>>} An array of instructor objects (ideally without passwords).
 */
exports.getAllInstructor = async () => {
    // It's good practice to exclude passwords when listing users
    return await Instructor.find({}).select('-password');
};

/**
 * Creates a new instructor with a hashed password.
 * @param {object} instructorData - Object containing name, email, and plainPassword.
 * @returns {Promise<object>} The created instructor object (without the password).
 * @throws {Error} If email already exists or for other DB errors.
 */
exports.addInstructor = async ({ name, email, password: plainPassword }) => {
    // Check if an instructor with this email already exists
    const existingInstructor = await Instructor.findOne({ email });
    if (existingInstructor) {
        const error = new Error('Instructor already exists with this email.');
        error.statusCode = 409; // Conflict
        throw error;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Or your preferred salt rounds
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Create and save the new instructor
    const newInstructor = new Instructor({
        name,
        email,
        password: hashedPassword, // Store the hashed password
    });
    await newInstructor.save();

    // Return the instructor data, excluding the password
    const instructorToReturn = newInstructor.toObject();
    delete instructorToReturn.password;
    return instructorToReturn;
};

/**
 * Updates an instructor's password.
 * Hashes the new password before saving.
 * @param {string} email - The email of the instructor to update.
 * @param {string} newPlainPassword - The new plain text password.
 * @returns {Promise<object|null>} The updated instructor object (without password), or null if not found.
 */
exports.updateInstructorPassword = async (email, newPlainPassword) => {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPlainPassword, salt);

    const updatedInstructor = await Instructor.findOneAndUpdate(
        { email: email }, // Find by email
        { $set: { password: newHashedPassword } },
        { new: true } // Return the updated document
    ).select('-password'); // Exclude password from the returned object

    return updatedInstructor; // Will be null if no instructor found with that email
};

/**
 * Updates instructor's details (excluding password).
 * For password updates, use updateInstructorPassword.
 * @param {string} email - The email of the instructor to update.
 * @param {object} updateData - Data to update (e.g., { name: newName }).
 * @returns {Promise<object|null>} The updated instructor object (without password), or null if not found.
 */
exports.updateInstructorDetails = async (email, updateData) => {
    // Explicitly remove password from updateData to prevent accidental plain text storage
    if (updateData.password) {
        delete updateData.password;
        // Optionally, log a warning or throw an error if password update is attempted here
        console.warn("Attempted to update password via updateInstructorDetails. Use updateInstructorPassword instead.");
    }

    if (Object.keys(updateData).length === 0) {
        return await Instructor.findOne({ email }).select('-password'); // No changes, return current
    }

    const updatedInstructor = await Instructor.findOneAndUpdate(
        { email: email },
        { $set: updateData },
        { new: true }
    ).select('-password');

    return updatedInstructor;
};


/**
 * Deletes an instructor by their email.
 * @param {string} email - The email of the instructor to delete.
 * @returns {Promise<object>} Deletion result from MongoDB (e.g., { deletedCount: 1 }).
 */
exports.deleteInstructor = async (email) => {
    // You might want to find the instructor first if you need to perform
    // cleanup actions based on their ID before deleting.
    // For now, direct deletion by email.
    return await Instructor.deleteOne({ email });
};

/**
 * Finds an instructor by their email (primarily for authentication).
 * This method returns the document *with* the hashed password.
 * @param {string} email
 * @returns {Promise<object|null>} Instructor document or null.
 */
exports.findInstructorByEmailForAuth = async (email) => {
    return await Instructor.findOne({ email });
};


// The old updateInstructor function logic was trying to update password based on name AND email.
// It's generally better to use a unique identifier like email or _id for updates.
// The function is now split into updateInstructorPassword and updateInstructorDetails.
// If you absolutely need the old `updateInstructor` behavior (updating password based on name/email match),
// you'd need to adapt `updateInstructorPassword` to find by name and email,
// but this is less robust than finding by a unique email.