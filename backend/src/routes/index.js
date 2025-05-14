const express = require('express');
const router = express.Router();

// Import individual routers
const userRoutes = require('./user.routes');
const courseRoutes=require('./course.routes');
const studentRoutes=require('./student.routes');
const assignmentRoutes=require('./assignment.routes');
const instructorRoutes=require('./instructor.routes')
const authRoutes=require('./auth')
const studentSubmissionRoutes=require('./studentSubmissionRoutes')
//const authRoutes = require('./auth.routes');

router.use('/users', userRoutes);
router.use('/courses',courseRoutes);
router.use('/students',studentRoutes);
router.use('/student',studentSubmissionRoutes);

router.use('/assignments',assignmentRoutes);
router.use('/instructors',instructorRoutes);
router.use('/auth',authRoutes)

//router.use('/auth', authRoutes);

module.exports = router;
