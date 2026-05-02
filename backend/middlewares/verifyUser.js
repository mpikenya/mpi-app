const jwt = require('jsonwebtoken');
require('dotenv').config();

// This middleware verifies tokens that YOUR server created.
const verifyToken = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided or token is malformed.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using YOUR own JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the decoded user information to the request object
        req.user = decoded; // The decoded object will contain { id: '...', name: '...', ... }
        
        next(); // Proceed to the next function (the controller)
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = verifyToken;