const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'),

    Loan = sequelize.define('Loan', {
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        term: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        state: {
            type: DataTypes.ENUM,
            values: ['PENDING', 'APPROVED', 'PAID'],
            defaultValue: 'PENDING'
        }
    });

Loan.belongsTo(User, {
    foreignKey: 'userId'
});

User.hasMany(Loan, {
    foreignKey: 'userId'
});

module.exports = Loan;
