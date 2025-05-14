const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  coursename: String,
  coursecode: String,
  
});

module.exports = mongoose.model('Course', courseSchema);
