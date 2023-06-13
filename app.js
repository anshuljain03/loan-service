const express = require('express'),

    app = express(),

    sequelize = require('./config/database'),

    authRoutes = require('./routes/auth'),
    userRoutes = require('./routes/user'),
    loanRoutes = require('./routes/loan'),

    PORT = 3000;

app.use(express.json());

app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/loans', loanRoutes);

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
