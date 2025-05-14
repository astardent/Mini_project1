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