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
exports.adminGetAllInstructors = async (req, res) => {
    try {
        const instructors = await InstructorService.getAllInstructor(); // Service already selects -password
        res.json(instructors || []);
    } catch (error) {
        console.error("Error in adminGetAllInstructors:", error);
        res.status(500).json({ error: 'Failed to retrieve instructors for admin.' });
    }
};

// POST /api/admin/instructors (Admin adds instructor)
exports.adminAddInstructor = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }
        // Service's addInstructor already handles hashing and email uniqueness check
        const newInstructor = await InstructorService.addInstructor({ name, email, password });
        res.status(201).json(newInstructor);
    } catch (error) {
        console.error("Error in adminAddInstructor:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message || 'Failed to add instructor.' });
    }
};

// GET /api/admin/instructors/:instructorId
exports.adminGetInstructorById = async (req, res) => {
     try {
        const instructor = await InstructorService.adminGetInstructorById(req.params.instructorId);
        if (!instructor) return res.status(404).json({ error: 'Instructor not found.' });
        res.json(instructor);
    } catch (error) {
        console.error("Error in adminGetInstructorById:", error);
        res.status(500).json({ error: 'Failed to retrieve instructor.' });
    }
};

// PUT /api/admin/instructors/:instructorId
exports.adminUpdateInstructor = async (req, res) => {
    try {
        const { instructorId } = req.params;
        const updateData = req.body;

        // Handle password change separately if needed
        if (updateData.password && updateData.password.trim() !== "") {
            await InstructorService.adminSetInstructorPassword(instructorId, updateData.password);
            delete updateData.password; // Don't pass it to details update
        }


        if (Object.keys(updateData).length === 0 && !(updateData.password && updateData.password.trim() !== "")) {
             // If only password was sent and handled, or no data at all
            const currentInstructor = await InstructorService.adminGetInstructorById(instructorId);
            if (!currentInstructor) return res.status(404).json({ error: "Instructor not found." });
            return res.json(currentInstructor); // Return current if no other details to update
        }


        if (Object.keys(updateData).length > 0) {
            const updatedInstructor = await InstructorService.adminUpdateInstructorDetailsById(instructorId, updateData);
            if (!updatedInstructor) { // This case might be hit if only password was in updateData and it's now empty
                 const currentInstructorAfterPw = await InstructorService.adminGetInstructorById(instructorId);
                 if (!currentInstructorAfterPw) return res.status(404).json({ error: "Instructor not found." });
                 return res.json(currentInstructorAfterPw);
            }
            res.json(updatedInstructor);
        }

    } catch (error) {
        console.error("Error in adminUpdateInstructor:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message || 'Failed to update instructor.' });
    }
};

// DELETE /api/admin/instructors/:instructorId
exports.adminDeleteInstructor = async (req, res) => {
    try {
        const { instructorId } = req.params;
        const result = await InstructorService.adminDeleteInstructorById(instructorId);
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Instructor not found." });
        }
        res.json({ message: "Instructor deleted successfully by admin." });
    } catch (error) {
        console.error("Error in adminDeleteInstructor:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message || 'Failed to delete instructor.' });
    }
};