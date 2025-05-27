// backend/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminAuthMiddleware = require('../middlewares/adminAuthMiddleware');

const studentController = require('../controllers/student.controller'); // For admin actions on students
const instructorController = require('../controllers/instructor.controller'); // For admin actions on instructors
const courseController = require('../controllers/course.controller'); // For admin actions on courses

// --- Student Management by Admin ---
// GET all students (admin only)
router.get('/students', authMiddleware, adminAuthMiddleware, studentController.adminGetAllStudents);
// GET a specific student by ID (admin only)
router.get('/students/:studentId', authMiddleware, adminAuthMiddleware, studentController.adminGetStudentById);
// PUT update a student's details (admin only) - careful with password updates
router.put('/students/:studentId', authMiddleware, adminAuthMiddleware, studentController.adminUpdateStudent);
// DELETE a student (admin only)
router.delete('/students/:studentId', authMiddleware, adminAuthMiddleware, studentController.adminDeleteStudent);
//ADD a student(admin only)
router.post('/students',authMiddleware,adminAuthMiddleware,studentController.addStudent);
// --- Instructor Management by Admin ---
// GET all instructors
router.get('/instructors', authMiddleware, adminAuthMiddleware, instructorController.adminGetAllInstructors);
// GET instructor by ID
router.get('/instructors/:instructorId', authMiddleware, adminAuthMiddleware, instructorController.adminGetInstructorById);
// PUT update instructor
router.put('/instructors/:instructorId', authMiddleware, adminAuthMiddleware, instructorController.adminUpdateInstructor);
// DELETE instructor
router.delete('/instructors/:instructorId', authMiddleware, adminAuthMiddleware, instructorController.adminDeleteInstructor);
// POST add new instructor (admin can do this)
router.post('/instructors', authMiddleware, adminAuthMiddleware, instructorController.adminAddInstructor);


// --- Course Management by Admin ---
// GET all courses
router.get('/courses', authMiddleware, adminAuthMiddleware, courseController.adminGetAllCourses);
// POST add new course
router.post('/courses', authMiddleware, adminAuthMiddleware, courseController.adminAddCourse);
// PUT update course by ID
router.put('/courses/:courseId', authMiddleware, adminAuthMiddleware, courseController.adminUpdateCourse);
// DELETE course by ID
router.delete('/courses/:courseId', authMiddleware, adminAuthMiddleware, courseController.adminDeleteCourse);

module.exports = router;