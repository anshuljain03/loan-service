const express = require('express'),
    router = express.Router(),

    loanController = require('../controllers/loanController'),
    authenticateToken = require('../middleware/authenticateToken');

router.get('/', authenticateToken, loanController.viewUserLoans);
router.post('/', authenticateToken, loanController.createLoan);
router.put('/:id/approve', authenticateToken, loanController.approveLoan);
router.get('/:id', authenticateToken, loanController.viewLoan);
router.post('/repayments', authenticateToken, loanController.addRepayment);

module.exports = router;
