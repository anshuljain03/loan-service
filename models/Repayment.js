const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Repayment = sequelize.define('Repayment', {
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    state: {
        type: DataTypes.ENUM,
        values: ['PENDING', 'PAID'],
        defaultValue: 'PENDING'
    },
    loanId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Repayment;
