// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Configure storage for Multer
// This example saves to a local 'uploads/' directory.
// For production, consider cloud storage (S3, etc.)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'E:/Web Dev/MINIPROJECT/uploads/assignments'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (optional: to accept only certain file types)
const fileFilter = (req, file, cb) => {
    // Example: Accept only pdf, doc, docx
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB file size limit (adjust as needed)
    },
    fileFilter: fileFilter // Apply the file filter
});

module.exports = upload;