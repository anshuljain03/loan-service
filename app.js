const express = require('express');
const app = express();
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const loanRoutes = require('./routes/loan');

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/loans', loanRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.info(`Server listening on port ${PORT}`);
});

// Sync the database and start the server
sequelize.sync({ force: false })
    .then(() => {
        console.info('Database tables created');
    })
    .catch((error) => {
        console.error('Unable to create database tables:', error);
    });
