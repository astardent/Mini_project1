// controllers/instructor.controller.js
const InstructorService = require('../services/instructor.service');

exports.getAllInstructor = async (req, res) => {
    try {
        const instructors = await InstructorService.getAllInstructor();
        res.json(instructors);
    } catch (error) {
        console.error("Error getting instructors:", error);
        res.status(500).json({ error: "Failed to retrieve instructors" });
    }
};

exports.addInstructor = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }
        const newInstructor = await InstructorService.addInstructor({ name, email, password });
        res.status(201).json({ message: "Instructor added successfully", instructor: newInstructor });
    } catch (err) {
        console.error("Error adding instructor:", err.message);
        if (err.statusCode === 409) { // Email conflict
            return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: "Failed to add instructor" });
    }
};

// Example: Endpoint specifically for updating password
exports.updateInstructorPassword = async (req, res) => {
    try {
        const { email, password: newPassword } = req.body; // Assuming email is in body to identify user
        if (!email || !newPassword) {
            return res.status(400).json({ error: "Email and new password are required." });
        }
        // You might want to add an 'oldPassword' field here for verification
        // if it's the instructor updating their own password.
        // If it's an admin function, then direct update might be fine with proper auth.

        const updatedInstructor = await InstructorService.updateInstructorPassword(email, newPassword);
        if (!updatedInstructor) {
            return res.status(404).json({ error: "Instructor not found with that email." });
        }
        res.json({ message: "Instructor password updated successfully", instructor: updatedInstructor });
    } catch (err) {
        console.error("Error updating instructor password:", err.message);
        res.status(500).json({ error: "Failed to update instructor password" });
    }
};

// Example: Endpoint for updating other instructor details
exports.updateInstructorProfile = async (req, res) => {
    try {
        const { email } = req.params; // Assuming email in URL to identify, or could be req.user.email
        const updateData = req.body; // e.g., { name: "New Name" }

        const updatedInstructor = await InstructorService.updateInstructorDetails(email, updateData);
        if (!updatedInstructor) {
            return res.status(404).json({ error: "Instructor not found with that email." });
        }
        res.json({ message: "Instructor details updated", instructor: updatedInstructor });
    } catch (err) {
        console.error("Error updating instructor details:", err.message);
        res.status(500).json({ error: "Failed to update instructor details" });
    }
};


exports.deleteInstructor = async (req, res) => {
    try {
        const { email } = req.body; // Or req.params.email if it's in the URL
        if (!email) {
            return res.status(400).json({ error: "Email is required to delete instructor." });
        }
        const result = await InstructorService.deleteInstructor(email);
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Instructor not found with that email." });
        }
        res.json({ message: "Instructor deleted successfully" });
    } catch (err) {
        console.error("Error deleting instructor:", err.message);
        res.status(500).json({ error: "Failed to delete instructor" });
    }
};