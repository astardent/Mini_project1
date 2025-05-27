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
exports.adminGetAllCourses = async (req, res) => {
    try {
        const courses = await CourseService.getAllCourses();
        res.json(courses || []);
    } catch (error) {
        console.error("Error in adminGetAllCourses:", error);
        res.status(500).json({ error: 'Failed to retrieve courses for admin.' });
    }
};

// POST /api/admin/courses
exports.adminAddCourse = async (req, res) => {
    try {
        const { coursename, coursecode } = req.body;
        if (!coursename || !coursecode) {
            return res.status(400).json({ error: "Course name and code are required." });
        }
        const newCourse = await CourseService.adminAddCourse({ coursename, coursecode });
        res.status(201).json(newCourse);
    } catch (error) {
        console.error("Error in adminAddCourse:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message || 'Failed to add course.' });
    }
};

// PUT /api/admin/courses/:courseId
exports.adminUpdateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const updateData = req.body;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No update data provided." });
        }
        const updatedCourse = await CourseService.adminUpdateCourseById(courseId, updateData);
        if (!updatedCourse) {
            return res.status(404).json({ error: "Course not found or update failed." });
        }
        res.json(updatedCourse);
    } catch (error) {
        console.error("Error in adminUpdateCourse:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message || 'Failed to update course.' });
    }
};

// DELETE /api/admin/courses/:courseId
exports.adminDeleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await CourseService.adminDeleteCourseById(courseId);
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Course not found." });
        }
        res.json({ message: "Course deleted successfully by admin." });
    } catch (error) {
        console.error("Error in adminDeleteCourse:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message || 'Failed to delete course.' });
    }
};