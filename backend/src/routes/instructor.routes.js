const express = require('express');
const router = express.Router();
const InstructorController=require('../controllers/instructor.controller')
const authMiddleware=require('../middlewares/authMiddleware')
const assignmentDefinitionController = require('../controllers/assignmentDefintion.controller');
router.get('/',InstructorController.getAllInstructor)
router.post('/addinstructor',InstructorController.addInstructor)
router.put('/updateinstructorpassword',InstructorController.updateInstructorPassword)
router.put('/updateinstructorprofile',InstructorController.updateInstructorProfile)
router.delete('/deleteinstructor',InstructorController.deleteInstructor)
router.post(
    '/',
    authMiddleware,
    // roleMiddleware.isInstructor, // Example
    assignmentDefinitionController.createAssignmentDefinition
);
module.exports=router;