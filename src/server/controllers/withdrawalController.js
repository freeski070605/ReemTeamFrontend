/**
  * Withdrawal Controller
 * 
 * Handles withdrawal requests and processing
 */

const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');

// Submit a withdrawal request
exports.submitWithdrawal = async (req, res) => {
  try {
    const { userId, amount, cashAppTag } = req.body;
    
    // Validate input
    if (!cashAppTag || !cashAppTag.startsWith('$')) {
      return res.status(400).json({ error: 'Invalid CashApp tag format' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has enough balance
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId,
      amount,
      cashAppTag
    });
    
    // Deduct from user balance
    user.balance -= amount;
    await user.save();
    
    await withdrawal.save();
    
    res.status(201).json(withdrawal);
  } catch (error) {
    console.error('Submit withdrawal error:', error);
    res.status(500).json({ error: 'Server error submitting withdrawal' });
  }
};

// Get user's withdrawal history
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const withdrawals = await Withdrawal.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json(withdrawals);
  } catch (error) {
    console.error('Get withdrawal history error:', error);
    res.status(500).json({ error: 'Server error getting withdrawal history' });
  }
};

// Admin: Process a withdrawal
exports.processWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, adminNotes } = req.body;
    
    // Validate status
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Find withdrawal
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    // Update withdrawal
    withdrawal.status = status;
    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }
    withdrawal.processedAt = Date.now();
    
    // If rejected, refund user
    if (status === 'rejected') {
      const user = await User.findById(withdrawal.userId);
      if (user) {
        user.balance += withdrawal.amount;
        await user.save();
      }
    }
    
    await withdrawal.save();
    
    res.json(withdrawal);
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({ error: 'Server error processing withdrawal' });
  }
};

// Admin: Get all pending withdrawals
exports.getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('userId', 'username email');
    
    res.json(withdrawals);
  } catch (error) {
    console.error('Get pending withdrawals error:', error);
    res.status(500).json({ error: 'Server error getting pending withdrawals' });
  }
};
 