const InstructorService=require('../services/instructor.service')

exports.getAllInstructor=async (req,res)=>{
    const instructor=await InstructorService.getAllInstructor();
    res.json(instructor);
};
exports.addInstructor = async (req, res) => {
    try {
        const { name, email, password } = req.body; // extract only relevant data
        const instructor = await InstructorService.addInstructor({ name, email, password });
        res.json({ msg: "Instructor added", instructor });
    } catch (err) {
        res.status(500).json({ error: "Failed to add Instructor" });
    }
};
exports.updateInstructor=async(req,res)=>{
    try{
        const { name, email, password } = req.body;
        const instructor=await InstructorService.updateInstructor({name,email,password});
        res.json({msg:"password updated",instructor});
    }catch(err){
        res.status(500).json({ error: "Failed to update Instructor" });       
    }
};
exports.deleteInstructor=async(req,res)=>{
    try{
        const {name,email}=req.body;
        const instructor=await InstructorService.deleteInstructor({name,email});
        if (instructor.deletedCount === 0) {
            return res.status(404).json({ error: "Instructor not found" });
        }
        res.json({msg:"Instructor deleted",instructor});
    }catch(err){
        res.status(500).json({error:"failed to delete the Instructor"});
    }
};
