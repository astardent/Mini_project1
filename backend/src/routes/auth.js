// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student.model');
const Instructor = require('../models/instructor.model');
const Admin = require('../models/admin.model'); // Make sure this model is created and imported

router.post('/login', async (req, res) => {
  const { email, password, role, name } = req.body; // 'name' might be from student/instructor login forms

  // --- 1. Adjust Initial Validation ---
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required.' });
  }
  // 'name' is specifically required for student and instructor by your current logic
  if ((role === 'student' || role === 'instructor') && !name) {
    return res.status(400).json({ error: 'Name is required for student/instructor login.' });
  }

  try {
    let userDocument; // Renamed from 'user' to avoid confusion with payload.user
    let isPasswordMatch = false; // Initialize to false

    if (role === 'admin') {
      userDocument = await Admin.findOne({ email });
      if (userDocument) {
        // Assuming your Admin model has a comparePassword instance method
        // as shown in the previous Admin model example
        isPasswordMatch = await userDocument.comparePassword(password);
      }
    } else if (role === 'student') {
      userDocument = await Student.findOne({ email, name }); // Student login uses email AND name
      if (userDocument && userDocument.password) { // Ensure password field exists
        isPasswordMatch = await bcrypt.compare(password, userDocument.password);
      }
    } else if (role === 'instructor') {
      userDocument = await Instructor.findOne({ email, name }); // Instructor login ALSO uses email AND name in your original
      if (userDocument && userDocument.password) { // Ensure password field exists
        isPasswordMatch = await bcrypt.compare(password, userDocument.password);
      }
    } else {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    if (!userDocument || !isPasswordMatch) {
      return res.status(400).json({ error: 'Invalid credentials or user not found.' });
    }

    // Password matched, create JWT payload
    const payload = {
      user: {
        id: userDocument._id, // Use ._id for consistency, Mongoose also provides .id virtual
        role: userDocument.role || role, // Prefer role from DB document if available, else from request
        // For Admin, 'name' might be 'username'. For Student/Instructor, it's 'name'.
        name: userDocument.name || userDocument.username || 'User',
        email: userDocument.email,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: payload.user,
        });
      }
    );
  } catch (err) {
    console.error("Login Error:", err.message, err.stack); // Log stack for more detail
    res.status(500).send('Server error during login.');
  }
});

module.exports = router;