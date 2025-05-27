// backend/src/middlewares/adminAuthMiddleware.js
module.exports = function(req, res, next) {
    // This assumes authMiddleware has already run and set req.user
    if (req.user && req.user.role === 'admin') {
        next(); // User is admin, proceed
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
};