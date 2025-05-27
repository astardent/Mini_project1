// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Configure storage for Multer
// This example saves to a local 'uploads/' directory.
// For production, consider cloud storage (S3, etc.)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'E:/Web Dev/MINIPROJECT/uploads/assignments'; // Your absolute path
        console.log("-----------------------------------------------------");
        console.log("[Multer Destination] Middleware reached.");
        console.log("[Multer Destination] Attempting to use path:", uploadPath, "for file:", file.originalname);
        // Simple check if path exists, good to add fs.mkdirSync if it doesn't
        const fs = require('fs');
        if (!fs.existsSync(uploadPath)) {
            console.error("[Multer Destination] UPLOAD PATH DOES NOT EXIST:", uploadPath);
            // cb(new Error("Upload path does not exist."), null); // This would stop multer
            // For testing, let it proceed, but know this is an issue. Ideally, create it.
            try {
                fs.mkdirSync(uploadPath, { recursive: true });
                console.log("[Multer Destination] Created upload path:", uploadPath);
                cb(null, uploadPath);
            } catch (mkdirErr) {
                console.error("[Multer Destination] FAILED TO CREATE UPLOAD PATH:", mkdirErr);
                cb(mkdirErr, null);
            }
        } else {
             cb(null, uploadPath);
        }
        console.log("-----------------------------------------------------");
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
    console.log("-----------------------------------------------------");
    console.log("[Multer FileFilter] Middleware reached.");
    console.log("[Multer FileFilter] Received file from client:", file.originalname, file.mimetype, file.size);
    console.log("[Multer FileFilter] Request body (if any text fields were sent):", req.body); // See if other form data is here
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        console.log("[Multer FileFilter] Rejected file type:", file.mimetype); // DEBUG
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX allowed.'), false);
    }
    console.log("-----------------------------------------------------");
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB file size limit (adjust as needed)
    },
    fileFilter: fileFilter // Apply the file filter
});

module.exports = upload;