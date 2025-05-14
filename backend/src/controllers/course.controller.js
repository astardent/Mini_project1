const CourseService=require('../services/course.service')

exports.getAllCourses = async (req, res) => {
    const courses=await CourseService.getAllCourses();
    res.json(courses);
};
exports.addCourse = async (req, res) => {
    try {
        const { coursename, coursecode } = req.body; // extract only relevant data
        const course = await CourseService.addCourse({ coursename, coursecode});
        res.json({ msg: "Course added", course });
    } catch (err) {
        res.status(500).json({ error: "Failed to add Course" });
    }
};
exports.updateCourse=async(req,res)=>{
    try{
        const { coursename, coursecode } = req.body;
        const course=await CourseService.updateCourse({coursename, coursecode});
        res.json({msg:"coursename updated",course});
    }catch(err){
        res.status(500).json({ error: "Failed to update Coursename" });       
    }
};
exports.deleteCourse=async(req,res)=>{
    try{
        const {coursename, coursecode}=req.body;
        const course=await CourseService.deleteCourse({coursename, coursecode});
        if (course.deletedCount === 0) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.json({msg:"Course deleted",course});
    }catch(err){
        res.status(500).json({error:"failed to delete the Course"});
    }
};