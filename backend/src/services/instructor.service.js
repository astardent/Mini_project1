const Instructor=require('../models/instructor.model')

exports.getAllInstructor=async()=>{
    return await Instructor.find({});
};
exports.addInstructor = async ({ name, email, password }) => {
    return await Instructor.create({ name, email, password });
};
exports.updateInstructor =async({name,email,password})=>{
    return await Instructor.findOneAndUpdate(
        {name:name,email:email},
        {$set:{password}},   //shorthand for password:password
        {new:true}
    );

};
exports.deleteInstructor =async({name,email})=>{
    return await Instructor.deleteOne(
        {name,email}
    );
};