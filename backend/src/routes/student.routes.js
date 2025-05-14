const express=require('express')
const router=express.Router();
const StudentController=require('../controllers/student.controller')

router.get('/',StudentController.getAllStudents);
router.post('/getstudent',StudentController.getStudents)
router.post('/addstudent',StudentController.addStudent);
router.put('/updatestudent',StudentController.updateStudent);
router.delete('/deletestudent',StudentController.deleteStudent);
module.exports=router;