// routes/auth.js (create this file)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student.model'); // Adjust path
const Instructor = require('../models/instructor.model'); // Adjust path

router.post('/login', async (req, res) => {
  const { email, password, role, name } = req.body;

  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'Name ,Email, password, and role are required.' });
  }

  try {
    let user;
    let UserModel;

    if (role === 'student') {
      UserModel = Student;
      // If 'name' is also part of login criteria along with email for students:
      // user = await UserModel.findOne({ email, name });
      // If only email is unique identifier for login:
      user = await UserModel.findOne({ email,name });
    } else if (role === 'instructor') {
      UserModel = Instructor;
      user = await UserModel.findOne({ email });
    } else {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials or user not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Password matched, create JWT payload
    const payload = {
      user: {
        id: user.id, // or user._id depending on your DB
        role: role, // or derive from user object if stored there
        name: user.name,
        email: user.email
        // Add any other non-sensitive info you might need on the frontend from the token
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }, // e.g., 1 hour, or 3600 for seconds
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: payload.user // Send back user info along with token
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;