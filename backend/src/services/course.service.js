const Course = require("../models/course.model")

exports.getAllCourses =async ()=>{
    return await Course.find({})
};
exports.addCourse = async ({ coursename, coursecode }) => {
    return await Course.create({ coursename, coursecode });
};
exports.updateCourse =async({coursename, coursecode})=>{
    return await Course.findOneAndUpdate(
        {coursecode},
        {$set:{coursename}},   //shorthand for password:password
        {new:true}
    );

};
exports.deleteCourse =async({coursename, coursecode})=>{
    return await Course.deleteOne(
        {coursename, coursecode}
    );
};