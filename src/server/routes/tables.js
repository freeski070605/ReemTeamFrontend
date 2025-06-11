/**
  * Table Routes
 */

const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /tables
// @desc    Get all tables
// @access  Public
router.get('/', tableController.getTables);

// @route   GET /tables/stake/:stake
// @desc    Get tables by stake amount
// @access  Public
router.get('/stake/:stake', tableController.getTablesByStake);

// @route   PUT /tables/:tableId/count
// @desc    Update table player count
// @access  Private
router.put('/:tableId/count', auth, tableController.updateTableCount);

// @route   POST /tables/init
// @desc    Initialize tables (admin only)
// @access  Private/Admin
router.post('/init', [auth, admin], tableController.initializeTables);

module.exports = router;
 