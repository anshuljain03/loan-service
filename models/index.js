const sequelize = require('../config/database'),
    User = require('./User'),
    Loan = require('./Loan'),
    Repayment = require('./Repayment');

// Associations
User.hasMany(Loan, { foreignKey: 'userId' });
Loan.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Loan, Repayment };
