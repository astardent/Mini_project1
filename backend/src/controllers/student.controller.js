const StudentService=require('../services/student.service')

exports.getAllStudents =async(req,res)=>{
    const students=await StudentService.getAllStudents();
    res.json(students);
};
exports.getStudents=async(req,res)=>{
    const {name,email,password}=req.body
    const students=await StudentService.getStudent({name,email,password})
    res.json(students);
}
exports.addStudent = async (req, res) => {
    const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const newStudent = await StudentService.addStudent({ name, email, password });
    // newStudent here will not have the password field
    res.status(201).json({ message: 'Student registered successfully', student: newStudent });
  } catch (err) {
    console.error(err.message);
    // Check for specific error from service, e.g., 'Student already exists'
    if (err.message.includes('Student already exists')) {
        return res.status(409).json({ error: err.message }); // 409 Conflict
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
};
exports.updateStudent=async(req,res)=>{
    try{
        const { name, email, password } = req.body;
        const student=await StudentService.updateStudent({name,email,password});
        res.json({msg:"password updated",student});
    }catch(err){
        res.status(500).json({ error: "Failed to update student" });       
    }
};
exports.deleteStudent=async(req,res)=>{
    try{
        const {name,email}=req.body;
        const student=await StudentService.deleteStudent({name,email});
        if (student.deletedCount === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json({msg:"Student deleted",student});
    }catch(err){
        res.status(500).json({error:"failed to delete the student"});
    }
};
exports.adminGetAllStudents = async (req, res) => {
    try {
        const students = await StudentService.getAllStudents(); // Service should exclude passwords
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve students.' });
    }
};

exports.adminGetStudentById = async (req, res) => {
    try {
        const student = await StudentService.getStudentProfileById(req.params.studentId); // Service should exclude password
        if (!student) return res.status(404).json({ error: 'Student not found.' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve student.' });
    }
};

exports.adminUpdateStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const updateData = req.body;

        // Admin should not directly set a plain text password.
        // If password change is needed, it should be a separate, secure process or a reset.
        if (updateData.password) {
            // For admin changing password, you might have a specific service:
            // await StudentService.adminSetStudentPassword(studentId, updateData.password);
            // delete updateData.password; // Don't pass plain password to generic update
            return res.status(400).json({ error: "Password updates for students by admin should use a dedicated mechanism."});
        }

        const updatedStudent = await StudentService.updateStudentDetailsById(studentId, updateData); // New service method
        if (!updatedStudent) return res.status(404).json({ error: 'Student not found or update failed.' });
        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update student.' });
    }
};

exports.adminDeleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params; // Correctly gets studentId from URL
        const result = await StudentService.deleteStudentById(studentId); // Calls the service
        if (result.deletedCount === 0) {
             // This means the service call was successful but no document matched the ID
            return res.status(404).json({ error: 'Student not found.' });
        }
        res.json({ message: 'Student deleted successfully.' });
    } catch (error) {
        // This is where the 500 error is likely being generated if the service throws
        console.error("Error in adminDeleteStudent controller:", error); // <<< ADD THIS LOG
        res.status(500).json({ error: 'Failed to delete student.' }); // This matches your frontend's default part
    }
};
