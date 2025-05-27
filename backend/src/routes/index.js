// routes/index.js
const express = require('express');
const router = express.Router();

// Import individual routers
const userRoutes = require('./user.routes');
const courseRoutes = require('./course.routes');
const studentRoutes = require('./student.routes'); // Likely for student profile, enrolled courses etc.
const assignmentDefinitionRoutes = require('./assignmentDefinition.routes'); // For instructor creating/managing definitions
const instructorRoutes = require('./instructor.routes');
const authRoutes = require('./auth');
const studentSubmissionRoutes = require('./studentSubmission.routes'); // For students submitting work
const adminRoutes=require('./admin.routes')
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/students', studentRoutes); // General student info
router.use('/admin',adminRoutes)
// --- Clarifications & Recommendations for Assignment/Submission Routes ---

// Option A: All assignment-related things under /assignments
// This means /assignments/ (for definitions by instructor/student view)
// and /assignments/:assignmentDefId/submit (for student submissions)
// and /assignments/:assignmentDefId/submissions (for instructor to view submissions)
router.use('/assignments', assignmentDefinitionRoutes); // Manages Assignment Definitions (GET all, GET by ID, POST new def, PUT, DELETE def)
router.use('/assignments', studentSubmissionRoutes);   // Manages Student Submissions (POST to /:assignmentDefId/submit)
                                                      // This will merge routes like:
                                                      // GET /assignments (from assignmentDefinitionRoutes)
                                                      // POST /assignments/:assignmentDefId/submit (from studentSubmissionRoutes)

// Option B: More distinct separation (might be cleaner if logic diverges significantly)
// router.use('/assignment-definitions', assignmentDefinitionRoutes); // For instructor CRUD on definitions
// router.use('/student-submissions', studentSubmissionRoutes); // For student actions on submissions

// For now, let's assume Option A is what you were leaning towards with the shared /assignments prefix.

router.use('/instructors', instructorRoutes);
router.use('/auth', authRoutes);

module.exports = router;