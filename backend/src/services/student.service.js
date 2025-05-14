// Предположим, это student.service.js или аналогичный файл
const Student = require('../models/student.model'); // Ensure path is correct
const bcrypt = require('bcryptjs'); // You need bcryptjs

// --- Service Functions ---

/**
 * Creates a new student with a hashed password.
 * @param {object} studentData - Object containing name, email, plainPassword.
 * @returns {Promise<object>} The created student object (without password).
 * @throws {Error} If email already exists or for other DB errors.
 */
exports.addStudent = async ({ name, email, password: plainPassword }) => {
  // Check if student already exists (can also be done in controller before calling service)
  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    // It's often better to throw an error that the controller can catch and format
    // For example: const error = new Error('Student already exists with this email'); error.statusCode = 400; throw error;
    // Or, for simplicity in this example, we'll let the unique index on email in DB handle it,
    // or assume controller checks this. If service checks, throw a clear error.
    throw new Error('Student already exists with this email'); // Or return a specific error object/code
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  const newStudent = new Student({
    name,
    email,
    password: hashedPassword,
    // ... other fields if any
  });

  await newStudent.save();

  // Return student data without the password
  const studentToReturn = newStudent.toObject(); // Convert Mongoose doc to plain object
  delete studentToReturn.password;
  return studentToReturn;
};

/**
 * Finds a student by their email. Primarily for login to get the hashed password.
 * @param {string} email
 * @returns {Promise<object|null>} Student object with hashed password, or null if not found.
 */
exports.findStudentByEmailForAuth = async (email) => {
  return await Student.findOne({ email }); // Returns the full student document including hashed password
};

/**
 * Gets a student's public profile by email (without password).
 * @param {string} email
 * @returns {Promise<object|null>} Student object without password, or null if not found.
 */
exports.getStudentProfileByEmail = async (email) => {
  return await Student.findOne({ email }).select('-password'); // Exclude password
};


/**
 * Gets a student's public profile by ID (without password).
 * @param {string} studentId
 * @returns {Promise<object|null>} Student object without password, or null if not found.
 */
exports.getStudentProfileById = async (studentId) => {
    return await Student.findById(studentId).select('-password');
};


/**
 * Gets all students (public profiles - without passwords).
 * @returns {Promise<Array<object>>} Array of student objects without passwords.
 */
exports.getAllStudents = async () => {
  return await Student.find({}).select('-password'); // Exclude passwords from the list
};

/**
 * Updates a student's password.
 * @param {string} email - Identifier for the student.
 * @param {string} newPlainPassword - The new plain text password.
 * @returns {Promise<object|null>} Updated student object (without password), or null if not found.
 */
exports.updateStudentPassword = async (email, newPlainPassword) => {
  const salt = await bcrypt.genSalt(10);
  const newHashedPassword = await bcrypt.hash(newPlainPassword, salt);

  const updatedStudent = await Student.findOneAndUpdate(
    { email: email },
    { $set: { password: newHashedPassword } },
    { new: true } // Return the updated document
  ).select('-password'); // Exclude password from the returned object

  return updatedStudent;
};

/**
 * Deletes a student by email.
 * @param {string} email
 * @returns {Promise<object>} Deletion result from MongoDB.
 */
exports.deleteStudentByEmail = async (email) => {
  return await Student.deleteOne({ email });
};

// If you still need a generic update function (be careful with what fields can be updated)
exports.updateStudentDetails = async (email, updateData) => {
    // Ensure password is not updated directly through this function
    if (updateData.password) {
        throw new Error("Password should be updated via updateStudentPassword method.");
    }
    return await Student.findOneAndUpdate(
        { email: email },
        { $set: updateData },
        { new: true }
    ).select('-password');
};