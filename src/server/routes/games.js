/**
  * Game Routes
 */

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');

// @route   POST /games
// @desc    Create a new game
// @access  Private
router.post('/', auth, gameController.createGame);

// @route   POST /games/:gameId/join
// @desc    Join an existing game
// @access  Private
router.post('/:gameId/join', auth, gameController.joinGame);

// @route   GET /games/:gameId
// @desc    Get game state
// @access  Private
router.get('/:gameId', auth, gameController.getGame);

// @route   POST /games/:gameId/action
// @desc    Perform game action (draw, discard, drop)
// @access  Private
router.post('/:gameId/action', auth, gameController.performAction);

module.exports = router;
 