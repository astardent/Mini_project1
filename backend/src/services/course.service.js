const Course = require("../models/course.model")
const mongoose = require('mongoose');
const AssignmentDefinition = require('../models/assignmentDefinition.model'); // For cascade delete check

// --- Public/General Methods (can be used by students/instructors for viewing) ---
exports.getAllCourses = async () => {
    return await Course.find({})
        // .populate('instructor', 'name email') // If you add an instructor ref to Course model
        .sort({ coursename: 1 });
};

exports.getCourseById = async (courseId) => {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return null;
    }
    return await Course.findById(courseId);
        // .populate('instructor', 'name email');
};


// --- Admin Specific Service Methods ---

/**
 * Admin adds a new course.
 */
exports.adminAddCourse = async ({ coursename, coursecode /*, instructorId (optional) */ }) => {
    const existingCourseByCode = await Course.findOne({ coursecode });
    if (existingCourseByCode) {
        const err = new Error(`Course with code '${coursecode}' already exists.`);
        err.statusCode = 409; // Conflict
        throw err;
    }
    // You might also want to check for existing coursename if that should be unique
    return await Course.create({ coursename, coursecode /*, instructor: instructorId */ });
};

/**
 * Admin updates a course by its ID.
 */
exports.adminUpdateCourseById = async (courseId, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        const err = new Error("Invalid Course ID format");
        err.statusCode = 400;
        throw err;
    }

    // Prevent updating coursecode if it's a critical identifier and other things depend on it string-wise
    // Or, if you allow it, ensure you handle cascading updates or checks elsewhere.
    if (updateData.coursecode) {
        const existingCourseByCode = await Course.findOne({ coursecode: updateData.coursecode, _id: { $ne: courseId } });
        if (existingCourseByCode) {
            const err = new Error(`Another course with code '${updateData.coursecode}' already exists.`);
            err.statusCode = 409;
            throw err;
        }
    }

    return await Course.findByIdAndUpdate(courseId, { $set: updateData }, { new: true });
};

/**
 * Admin deletes a course by its ID.
 */
exports.adminDeleteCourseById = async (courseId) => {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        const err = new Error("Invalid Course ID format");
        err.statusCode = 400;
        throw err;
    }

    // IMPORTANT: Business logic for what happens when a course is deleted.
    // Do you delete all associated AssignmentDefinitions? StudentSubmissions? Enrollments?
    // This is a critical decision.
    // Example: Prevent deletion if assignments exist for this course
    const assignmentsExist = await AssignmentDefinition.findOne({ course: courseId });
    if (assignmentsExist) {
        const err = new Error("Cannot delete course. Assignments still exist for this course. Please delete them first or reassign them.");
        err.statusCode = 400; // Or 409 Conflict
        throw err;
    }
    // If you decide to cascade delete (USE WITH EXTREME CAUTION):
    // await AssignmentDefinition.deleteMany({ course: courseId });
    // await StudentSubmission.deleteMany({ course: courseId });
    // await Enrollment.deleteMany({ course: courseId });


    return await Course.deleteOne({ _id: courseId });
};
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