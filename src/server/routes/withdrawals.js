/**
  * Withdrawal Routes
 */

const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   POST /withdrawals
// @desc    Submit a withdrawal request
// @access  Private
router.post('/', auth, withdrawalController.submitWithdrawal);

// @route   GET /withdrawals/user/:userId
// @desc    Get user's withdrawal history
// @access  Private
router.get('/user/:userId', auth, withdrawalController.getWithdrawalHistory);

// @route   PUT /withdrawals/:withdrawalId/process
// @desc    Process a withdrawal (admin only)
// @access  Private/Admin
router.put('/:withdrawalId/process', [auth, admin], withdrawalController.processWithdrawal);

// @route   GET /withdrawals/pending
// @desc    Get all pending withdrawals (admin only)
// @access  Private/Admin
router.get('/pending', [auth, admin], withdrawalController.getPendingWithdrawals);

module.exports = router;
 