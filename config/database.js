module.exports = {
    development: {
        username: 'your-username',
        password: 'your-password',
        database: 'your-database',
        host: 'localhost',
        dialect: 'mysql'
    },
    production: {
        // Add production configuration if needed
    }
};

const { Sequelize } = require('sequelize'),
    sequelize = new Sequelize('loan-db',
        'root',
        'rootpassword', {
            host: 'localhost',
            dialect: 'mysql'
        });

module.exports = sequelize;
