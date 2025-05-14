const express = require('express');
const router = express.Router();
const CourseController=require('../controllers/course.controller')
router.get('/',CourseController.getAllCourses);
router.post('/addcourse',CourseController.addCourse);
router.put('/updatecourse',CourseController.updateCourse);
router.delete('/deletecourse',CourseController.deleteCourse);
module.exports =router;