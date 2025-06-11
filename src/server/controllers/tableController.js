/**
  * Table Controller
 * 
 * Handles table listing and management
 */

const Table = require('../models/Table');

// Get all tables
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true }).sort({ amount: 1 });
    res.json(tables);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ error: 'Server error getting tables' });
  }
};

// Get tables by stake amount
exports.getTablesByStake = async (req, res) => {
  try {
    const { stake } = req.params;
    
    // Validate stake
    const stakeAmount = parseInt(stake);
    if (![1, 5, 10, 20, 50].includes(stakeAmount)) {
      return res.status(400).json({ error: 'Invalid stake amount' });
    }
    
    const tables = await Table.find({ 
      amount: stakeAmount,
      isActive: true
    });
    
    res.json(tables);
  } catch (error) {
    console.error('Get tables by stake error:', error);
    res.status(500).json({ error: 'Server error getting tables' });
  }
};

// Update table player count
exports.updateTableCount = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { change } = req.body;
    
    // Validate change
    if (change !== 1 && change !== -1) {
      return res.status(400).json({ error: 'Invalid player count change' });
    }
    
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    // Update player count
    table.currentPlayers += change;
    
    // Ensure count doesn't go below 0 or above max
    if (table.currentPlayers < 0) {
      table.currentPlayers = 0;
    } else if (table.currentPlayers > table.maxPlayers) {
      table.currentPlayers = table.maxPlayers;
    }
    
    table.lastUpdated = Date.now();
    await table.save();
    
    res.json(table);
  } catch (error) {
    console.error('Update table count error:', error);
    res.status(500).json({ error: 'Server error updating table' });
  }
};

// Initialize tables (for setup purposes)
exports.initializeTables = async (req, res) => {
  try {
    // Check if tables already exist
    const existingCount = await Table.countDocuments();
    
    if (existingCount > 0) {
      return res.status(400).json({ error: 'Tables already initialized' });
    }
    
    // Create sample tables
    const tableStakes = [1, 1, 5, 5, 10, 20, 50];
    const tables = [];
    
    for (const amount of tableStakes) {
      const table = new Table({
        amount,
        currentPlayers: Math.floor(Math.random() * 4) + 1
      });
      
      tables.push(table);
    }
    
    await Table.insertMany(tables);
    
    res.status(201).json({ message: 'Tables initialized successfully', count: tables.length });
  } catch (error) {
    console.error('Initialize tables error:', error);
    res.status(500).json({ error: 'Server error initializing tables' });
  }
};
 