const { mockRequest, mockResponse } = require('jest-mock-req-res');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const userController = require('../../controllers/userController');

jest.mock('bcrypt');
jest.mock('../../models/User');

describe('User Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('createUser', () => {
        it('should create a user and return success message', async () => {
            const mockUsername = 'testuser';
            const mockPassword = 'password123';
            const mockRole = 'user';

            const mockHashedPassword = 'hashedpassword123';

            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue(mockHashedPassword);
            User.create.mockResolvedValue();

            const req = mockRequest({ body: { username: mockUsername, password: mockPassword, role: mockRole } });
            const res = mockResponse();

            await userController.createUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ where: { username: mockUsername } });
            expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
            expect(User.create).toHaveBeenCalledWith({
                username: mockUsername,
                password: mockHashedPassword,
                role: mockRole
            });
            expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully' });
        });

        it('should handle duplicate username and return conflict status', async () => {
            const mockUsername = 'testuser';
            const mockPassword = 'password123';
            const mockRole = 'user';

            User.findOne.mockResolvedValue({});

            const req = mockRequest({ body: { username: mockUsername, password: mockPassword, role: mockRole } });
            const res = mockResponse();

            await userController.createUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ where: { username: mockUsername } });
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'Username already exists' });
        });

        it('should handle errors and return 500 status', async () => {
            const mockUsername = 'testuser';
            const mockPassword = 'password123';
            const mockRole = 'user';

            User.findOne.mockRejectedValue(new Error('Database error'));

            const req = mockRequest({ body: { username: mockUsername, password: mockPassword, role: mockRole } });
            const res = mockResponse();

            await userController.createUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ where: { username: mockUsername } });
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        });
    });

    describe('updateUser', () => {
        it('should update a user and return success message', async () => {
            const mockUserId = 1;
            const mockUsername = 'testuser';
            const mockPassword = 'newpassword123';

            const mockUser = { id: mockUserId, username: 'oldusername', password: 'oldpassword', save: jest.fn() };
            const mockHashedPassword = 'hashednewpassword123';

            User.findByPk.mockResolvedValue(mockUser);
            bcrypt.hash.mockResolvedValue(mockHashedPassword);

            const req = mockRequest({
                params: { id: mockUserId }, body: { username: mockUsername, password: mockPassword }
            });
            const res = mockResponse();

            await userController.updateUser(req, res);

            expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
            expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
            expect(mockUser.username).toBe(mockUsername);
            expect(mockUser.password).toBe(mockHashedPassword);
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully' });
        });

        it('should handle user not found and return 404 status', async () => {
            const mockUserId = 1;
            const mockUsername = 'testuser';
            const mockPassword = 'newpassword123';

            User.findByPk.mockResolvedValue(null);

            const req = mockRequest({
                params: { id: mockUserId }, body: { username: mockUsername, password: mockPassword }
            });
            const res = mockResponse();

            await userController.updateUser(req, res);

            expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should handle errors and return 500 status', async () => {
            const mockUserId = 1;
            const mockUsername = 'testuser';
            const mockPassword = 'newpassword123';

            User.findByPk.mockRejectedValue(new Error('Database error'));

            const req = mockRequest({
                params: { id: mockUserId }, body: { username: mockUsername, password: mockPassword }
            });
            const res = mockResponse();

            await userController.updateUser(req, res);

            expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        });
    });

    describe('deleteUser', () => {
        it('should delete a user and return success message', async () => {
            const mockUserId = 1;
            const mockUser = { id: mockUserId, destroy: jest.fn() };

            User.findByPk.mockResolvedValue(mockUser);

            const req = mockRequest({ params: { id: mockUserId } });
            const res = mockResponse();

            await userController.deleteUser(req, res);

            expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
            expect(mockUser.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
        });

        it('should handle user not found and return 404 status', async () => {
            const mockUserId = 1;

            User.findByPk.mockResolvedValue(null);

            const req = mockRequest({ params: { id: mockUserId } });
            const res = mockResponse();

            await userController.deleteUser(req, res);

            expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should handle errors and return 500 status', async () => {
            const mockUserId = 1;

            User.findByPk.mockRejectedValue(new Error('Database error'));

            const req = mockRequest({ params: { id: mockUserId } });
            const res = mockResponse();

            await userController.deleteUser(req, res);

            expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        });
    });
});
