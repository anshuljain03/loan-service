const authController = require('../../controllers/authController');
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return a JWT token if the username and password are valid', async () => {
            // Mock the request body
            const req = {
                    body: { username: 'testuser', password: 'password' }
                },

                mockUser = {
                    id: 1,
                    username: 'testuser',
                    password: 'hashedpassword',
                    role: 'user'
                };

            User.findOne.mockResolvedValue(mockUser);

            // Mock the password comparison
            bcrypt.compare.mockResolvedValue(true);

            // Mock the JWT sign method
            const mockToken = 'mocktoken';

            jwt.sign.mockReturnValue(mockToken);

            // Mock the response object
            const res = {
                json: jest.fn()
            };

            // Call the login function
            await authController.login(req, res);

            // Assert that User.findOne has been called with the correct username
            expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });

            // Assert that bcrypt.compare has been called with the correct password
            expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');

            // Assert that jwt.sign has been called with the correct payload and secret key
            expect(jwt.sign).toHaveBeenCalledWith({ userId: 1, username: 'testuser', role: 'user' },
                'random-key');

            // Assert that the response json method has been called with the token
            expect(res.json).toHaveBeenCalledWith({ token: mockToken });
        });

        it('should return an error message if the username or password is invalid', async () => {
            // Mock the request body
            const req = {
                body: { username: 'testuser', password: 'password' }
            };

            // Mock the user record as null (not found)
            User.findOne.mockResolvedValue(null);

            // Mock the response object
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Call the login function
            await authController.login(req, res);

            // Assert that User.findOne has been called with the correct username
            expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });

            // Assert that the response status is 401 (Unauthorized) and the error message is returned
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
        });
    });
});
