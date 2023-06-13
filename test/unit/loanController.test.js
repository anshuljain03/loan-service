const { mockRequest, mockResponse } = require('jest-mock-req-res');
const Loan = require('../../models/Loan');
const Repayment = require('../../models/Repayment');
const loanController = require('../../controllers/loanController');

jest.mock('../../models/Loan');
jest.mock('../../models/Repayment');

describe('Loan Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('createLoan', () => {
        it('should create a loan and generate scheduled repayments', async () => {
            const mockAmount = 10000,
                mockTerm = 3,
                mockUserId = 1,
                mockLoanId = 1,

                mockLoan = { id: mockLoanId };

            Loan.create.mockResolvedValue(mockLoan);
            Repayment.bulkCreate.mockResolvedValue();

            const req = mockRequest({ body: { amount: mockAmount, term: mockTerm }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.createLoan(req, res);

            expect(Loan.create).toHaveBeenCalledWith({ amount: mockAmount, term: mockTerm, userId: mockUserId });
            expect(Repayment.bulkCreate).toHaveBeenCalledWith(expect.any(Array));
            expect(res.json).toHaveBeenCalledWith({ message: 'Loan created successfully', id: 1 });
        });

        it('should handle errors and return 500 status', async () => {
            const mockUserId = 1,
                mockAmount = 10000,
                mockTerm = 3;

            Loan.create.mockRejectedValue(new Error('Database error'));

            const req = mockRequest({ user: { userId: mockUserId }, body: { amount: mockAmount, term: mockTerm } }),
                res = mockResponse();

            await loanController.createLoan(req, res);

            expect(Loan.create).toHaveBeenCalledWith({ amount: mockAmount, term: mockTerm, userId: mockUserId });
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        });
    });

    describe('approveLoan', () => {
        it('should approve a loan and return success message', async () => {
            const mockLoanId = 1,
                mockAdminUserId = 2,

                mockLoan = { id: mockLoanId, state: 'PENDING', save: jest.fn() };

            Loan.findByPk.mockResolvedValue(mockLoan);

            const req = mockRequest({ params: { id: mockLoanId }, user: { userId: mockAdminUserId, role: 'admin' } }),
                res = mockResponse();

            await loanController.approveLoan(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(mockLoan.state).toBe('APPROVED');
            expect(mockLoan.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Loan approved successfully' });
        });

        it('should handle non-admin user and return 403 status', async () => {
            const mockLoanId = 1,
                mockUserId = 2,

                req = mockRequest({ params: { id: mockLoanId }, user: { userId: mockUserId, role: 'customer' } }),
                res = mockResponse();

            await loanController.approveLoan(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized access' });
        });

        it('should handle loan not found and return 404 status', async () => {
            const mockLoanId = 1,
                mockAdminUserId = 2;

            Loan.findByPk.mockResolvedValue(null);

            const req = mockRequest({ params: { id: mockLoanId }, user: { userId: mockAdminUserId, role: 'admin' } }),
                res = mockResponse();

            await loanController.approveLoan(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Loan not found' });
        });

        it('should handle errors and return 500 status', async () => {
            const mockLoanId = 1,
                mockAdminUserId = 2;

            Loan.findByPk.mockRejectedValue(new Error('Database error'));

            const req = mockRequest({ params: { id: mockLoanId }, user: { userId: mockAdminUserId, role: 'admin' } }),
                res = mockResponse();

            await loanController.approveLoan(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        });
    });

    describe('viewLoan', () => {
        it('should view a loan and return the loan details', async () => {
            const mockLoanId = 1,
                mockUserId = 2,

                mockLoan = { id: mockLoanId, userId: mockUserId };

            Loan.findByPk.mockResolvedValue(mockLoan);

            const req = mockRequest({ params: { id: mockLoanId }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.viewLoan(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(res.json).toHaveBeenCalledWith({ loan: mockLoan });
        });

        it('should handle loan not found and return 404 status', async () => {
            const mockLoanId = 1,
                mockUserId = 2;

            Loan.findByPk.mockResolvedValue(null);

            const req = mockRequest({ params: { id: mockLoanId }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.viewLoan(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Loan not found' });
        });

        it('should handle unauthorized access and return 403 status', async () => {
            const mockLoanId = 1,
                mockUserId = 2,

                mockLoan = { id: mockLoanId, userId: 3 };

            Loan.findByPk.mockResolvedValue(mockLoan);

            const req = mockRequest({ params: { id: mockLoanId }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.viewLoan(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized access' });
        });

        it('should handle errors and return 500 status', async () => {
            const mockLoanId = 1,
                mockUserId = 2;

            Loan.findByPk.mockRejectedValue(new Error('Database error'));

            const req = mockRequest({ params: { id: mockLoanId }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.viewLoan(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        });
    });

    describe('viewUserLoans', () => {
        it('should view all loans belonging to a user', async () => {
            const mockUserId = 1,
                mockLoans = [{ id: 1, userId: mockUserId }, { id: 2, userId: mockUserId }];

            Loan.findAll.mockResolvedValue(mockLoans);

            const req = mockRequest({ user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.viewUserLoans(req, res);

            expect(Loan.findAll).toHaveBeenCalledWith({ where: { userId: mockUserId } });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ loans: mockLoans });
        });

        it('should handle errors and return 500 status', async () => {
            const mockUserId = 1;

            Loan.findAll.mockRejectedValue(new Error('Database error'));

            const req = mockRequest({ user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.viewUserLoans(req, res);

            expect(Loan.findAll).toHaveBeenCalledWith({ where: { userId: mockUserId } });
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch user loans' });
        });
    });

    describe('addRepayment', () => {
        it('should add a repayment, update the next pending repayment to paid', async () => {
            const mockLoanId = 1,
                mockUserId = 2,
                mockAmount = 5000,

                mockLoan = { id: mockLoanId, userId: mockUserId, state: 'APPROVED', save: jest.fn() },
                mockNextRepayment = { amount: 3333.33, state: 'PENDING', save: jest.fn() };

            Loan.findByPk.mockResolvedValue(mockLoan);
            Repayment.findOne.mockResolvedValue(mockNextRepayment);
            Repayment.count.mockResolvedValue(mockLoan.term);

            const req = mockRequest({ body: { loanId: mockLoanId, amount: mockAmount }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.addRepayment(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(Repayment.findOne).toHaveBeenCalledWith({
                where: { LoanId: mockLoanId, state: 'PENDING' },
                order: [['dueDate', 'ASC']]
            });
            expect(mockNextRepayment.state).toBe('PAID');
            expect(mockNextRepayment.save).toHaveBeenCalled();
            expect(mockLoan.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Repayment added successfully' });
        });

        it('should update loan state if all repayments are paid', async () => {
            const mockLoanId = 1,
                mockUserId = 2,
                mockAmount = 5000,

                mockLoan = { id: mockLoanId, userId: mockUserId, state: 'APPROVED', save: jest.fn() },
                mockNextRepayment = { amount: 3333.33, state: 'PENDING', save: jest.fn() };

            Loan.findByPk.mockResolvedValue(mockLoan);
            Repayment.findOne.mockResolvedValue(mockNextRepayment);
            Repayment.count.mockResolvedValue(mockLoan.term);

            const req = mockRequest({ body: { loanId: mockLoanId, amount: mockAmount }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.addRepayment(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(Repayment.findOne).toHaveBeenCalledWith({
                where: { LoanId: mockLoanId, state: 'PENDING' },
                order: [['dueDate', 'ASC']]
            });
            expect(mockNextRepayment.state).toBe('PAID');
            expect(mockNextRepayment.save).toHaveBeenCalled();
            expect(mockLoan.state).toBe('PAID');
            expect(mockLoan.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Repayment added successfully' });
        });

        it('should handle loan not found and return 404 status', async () => {
            // Mock the required variables
            const mockLoanId = 1,
                mockUserId = 2;

            // Mock the Loan.findByPk function to return null
            Loan.findByPk.mockResolvedValue(null);

            // Create the request object with the required properties
            const req = {
                    body: { loanId: mockLoanId },
                    user: { userId: mockUserId }
                },

                // Create the response object with the necessary methods
                res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                };

            // Call the addRepayment controller function
            await loanController.addRepayment(req, res);

            // Assert that Loan.findByPk has been called with the correct loanId
            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);

            // Assert that Repayment.findOne has not been called
            expect(Repayment.findOne).not.toHaveBeenCalled();

            // Assert that the response status is 404 and the message is 'Loan not found'
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Loan not found' });
        });


        it('should handle unauthorized access and return 403 status', async () => {
            const mockLoanId = 1,
                mockUserId = 2,
                mockAmount = 5000,

                mockLoan = { id: mockLoanId, userId: 3, state: 'APPROVED' };

            Loan.findByPk.mockResolvedValue(mockLoan);

            const req = mockRequest({ body: { loanId: mockLoanId, amount: mockAmount }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.addRepayment(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(Repayment.findOne).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized access' });
        });

        it('should handle loan already paid off and return 403 status', async () => {
            const mockLoanId = 1,
                mockUserId = 2,
                mockAmount = 5000,

                mockLoan = { id: mockLoanId, userId: mockUserId, state: 'PAID' };

            Loan.findByPk.mockResolvedValue(mockLoan);

            const req = mockRequest({ body: { loanId: mockLoanId, amount: mockAmount }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.addRepayment(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(Repayment.findOne).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'This loan has already been paid off' });
        });

        it('should handle loan not approved and return 403 status', async () => {
            const mockLoanId = 1,
                mockUserId = 2,
                mockAmount = 5000,

                mockLoan = { id: mockLoanId, userId: mockUserId, state: 'PENDING' };

            Loan.findByPk.mockResolvedValue(mockLoan);

            const req = mockRequest({ body: { loanId: mockLoanId, amount: mockAmount }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.addRepayment(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(Repayment.findOne).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                { message: 'Ensure that your loan has been approved. Ask an admin for help.' }
            );
        });

        it('should handle no pending repayments and return 404 status', async () => {
            const mockLoanId = 1,
                mockUserId = 2,
                mockAmount = 5000,

                mockLoan = { id: mockLoanId, userId: mockUserId, state: 'APPROVED' };

            Loan.findByPk.mockResolvedValue(mockLoan);
            Repayment.findOne.mockResolvedValue(null);

            const req = mockRequest({ body: { loanId: mockLoanId, amount: mockAmount }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.addRepayment(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(Repayment.findOne).toHaveBeenCalledWith({
                where: { LoanId: mockLoanId, state: 'PENDING' },
                order: [['dueDate', 'ASC']]
            });
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No pending repayments found' });
        });

        it('should handle invalid repayment amount and return 400 status', async () => {
            const mockLoanId = 1,
                mockUserId = 2,
                mockAmount = 3000,

                mockLoan = { id: mockLoanId, userId: mockUserId, state: 'APPROVED' },
                mockNextRepayment = { amount: 3333.33, state: 'PENDING' };

            Loan.findByPk.mockResolvedValue(mockLoan);
            Repayment.findOne.mockResolvedValue(mockNextRepayment);

            const req = mockRequest({ body: { loanId: mockLoanId, amount: mockAmount }, user: { userId: mockUserId } }),
                res = mockResponse();

            await loanController.addRepayment(req, res);

            expect(Loan.findByPk).toHaveBeenCalledWith(mockLoanId);
            expect(Repayment.findOne).toHaveBeenCalledWith({
                where: { LoanId: mockLoanId, state: 'PENDING' },
                order: [['dueDate', 'ASC']]
            });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: `Invalid repayment amount. Please increase the amount to at least ${mockNextRepayment.amount}`
            });
        });
    });
});
