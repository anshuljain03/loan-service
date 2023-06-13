const jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt'),

    User = require('../models/User');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Note: The random key should be should be a secret string for production systems
        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role },
            'random-key');

        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Since JWT has fixed expiry we can reply on that or if we want a proper log out functionality
// we can implement a blacklist for revocation of jwt token
