const jwt = require('jsonwebtoken'),

    authenticateToken = (req, res, next) => {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        jwt.verify(token, 'random-key', (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }

            // Set the user object with the decoded payload, including the role
            req.user = user;
            next();
        });
    };

module.exports = authenticateToken;
