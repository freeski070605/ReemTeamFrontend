/**
  * Game Model for MongoDB
 */

const mongoose = require('mongoose');

// Schema for cards
const cardSchema = new mongoose.Schema({
  id: String,
  rank: String,
  suit: String,
  value: Number,
  isHidden: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Schema for players
const playerSchema = new mongoose.Schema({
  id: String,
  username: String,
  avatar: String,
  hand: [cardSchema],
  score: {
    type: Number,
    default: 0
  },
  isDropped: {
    type: Boolean,
    default: false
  },
  canDrop: {
    type: Boolean,
    default: true
  },
  penalties: {
    type: Number,
    default: 0
  },
  isAI: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Main game schema
const gameSchema = new mongoose.Schema({
  players: [playerSchema],
  currentPlayerIndex: {
    type: Number,
    default: 0
  },
  deck: [cardSchema],
  discardPile: [cardSchema],
  status: {
    type: String,
    enum: ['waiting', 'playing', 'ended'],
    default: 'waiting'
  },
  stake: {
    type: Number,
    required: true
  },
  pot: {
    type: Number,
    default: function() {
      return this.stake * 4; // Assuming 4 players
    }
  },
  winner: {
    type: String,
    default: null
  },
  winningMultiplier: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Games expire after 24 hours
  },
  lastActionAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
gameSchema.index({ status: 1, stake: 1 });
gameSchema.index({ 'players.id': 1 });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
 