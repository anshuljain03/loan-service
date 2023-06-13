// Using root ease of use. Ideally a new user should be created with fine grained permissions to
// the database and tables being used
const { Sequelize } = require('sequelize'),
    sequelize = new Sequelize('loan-db',
        'root',
        'rootpassword', {
            host: 'localhost',
            dialect: 'mysql'
        });

module.exports = sequelize;
