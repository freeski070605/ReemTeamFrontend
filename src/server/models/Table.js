/**
  * Table Model for MongoDB
 */

const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    enum: [1, 5, 10, 20, 50] // Valid stake amounts
  },
  maxPlayers: {
    type: Number,
    default: 4
  },
  currentPlayers: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
tableSchema.index({ amount: 1 });
tableSchema.index({ isActive: 1 });

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
 