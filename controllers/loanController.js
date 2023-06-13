const Loan = require('../models/Loan'),
    Repayment = require('../models/Repayment');

exports.createLoan = async (req, res) => {
    const { amount, term } = req.body,
        userId = req.user.userId;

    try {
        const loan = await Loan.create({ amount, term, userId });

        const repaymentAmount = (amount / term).toFixed(2);

        // Generate the scheduled repayments associated with the loan
        const scheduledRepayments = [];
        let currentDate = new Date();

        for (let i = 0; i < term; i++) {
            const dueDate = new Date(currentDate);

            // Note: Considering the repayment period to be 1 week by default. This should be an input
            dueDate.setDate(dueDate.getDate() + 7 * (i + 1));

            scheduledRepayments.push({
                amount: repaymentAmount,
                dueDate: dueDate,
                state: 'PENDING',
                loanId: loan.id
            });
        }

        await Repayment.bulkCreate(scheduledRepayments);

        res.json({ message: 'Loan created successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Admin approves a loan
exports.approveLoan = async (req, res) => {
    const loanId = req.params.id;

    try {
        // Check if the authenticated user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const loan = await Loan.findByPk(loanId);

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        loan.state = 'APPROVED';
        await loan.save();

        res.json({ message: 'Loan approved successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.viewLoan = async (req, res) => {
    const loanId = req.params.id;

    try {
        const loan = await Loan.findByPk(loanId);

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        if (loan.userId !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const repayments = await Repayment.findAll({ where: { loanId } });

        res.json({ loan, repayments });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.viewUserLoans = async (req, res) => {
    try {
        const userId = req.user.userId;
        const loans = await Loan.findAll({ where: { userId } });

        return res.status(200).json({ loans });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user loans' });
    }
};


exports.addRepayment = async (req, res) => {
    const { loanId, amount } = req.body;

    try {
        const loan = await Loan.findByPk(loanId);

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        // Check if the loan belongs to the authenticated user
        if (loan.userId !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // Don't allow if loan is paid off
        if (loan.state === 'PAID') {
            return res.status(403).json({ message: 'This loan has already been paid off' });
        }

        // Check if the loan has been approved
        if (loan.state !== 'APPROVED') {
            return res.status(403).json({ message: 'Ensure that your loan has been approved. Ask an admin for help.' });
        }

        // Find the next scheduled repayment with status 'PENDING'
        const nextRepayment = await Repayment.findOne({
            where: {
                LoanId: loanId,
                state: 'PENDING'
            },
            order: [['dueDate', 'ASC']]
        });

        if (!nextRepayment) {
            return res.status(404).json({ message: 'No pending repayments found' });
        }

        // Check if the provided amount is greater or equal to the repayment amount
        if (amount < nextRepayment.amount) {
            return res.status(400).json(
                { message: `Invalid repayment amount. Please increase the amount to at least ${nextRepayment.amount}` }
            );
        }

        nextRepayment.state = 'PAID';
        await nextRepayment.save();

        const allRepaymentsPaid = await Repayment.count({
            where: {
                LoanId: loanId,
                state: 'PAID'
            }
        }) === loan.term;

        // If all repayments are 'PAID', update the loan's state to 'PAID'
        if (allRepaymentsPaid) {
            loan.state = 'PAID';
            await loan.save();
        }

        res.json({ message: 'Repayment added successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
