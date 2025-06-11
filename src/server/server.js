/**
  * Reem Team Game Server
 * 
 * Main server entry point
 */

const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./dbConfig');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const tableRoutes = require('./routes/tables');
const withdrawalRoutes = require('./routes/withdrawals');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB
connectToDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Logger
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Routes
app.use('/auth', authRoutes);
app.use('/games', gameRoutes);
app.use('/tables', tableRoutes);
app.use('/withdrawals', withdrawalRoutes);

// Socket.io setup
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a game room
  socket.on('joinGame', (gameId) => {
    socket.join(`game-${gameId}`);
    console.log(`Client joined game: ${gameId}`);
  });
  
  // Leave a game room
  socket.on('leaveGame', (gameId) => {
    socket.leave(`game-${gameId}`);
    console.log(`Client left game: ${gameId}`);
  });
  
  // Join lobby
  socket.on('joinLobby', () => {
    socket.join('lobby');
    console.log('Client joined lobby');
    
    // Send current player count
    io.to('lobby').emit('playerCount', {
      count: io.sockets.adapter.rooms.get('lobby')?.size || 0
    });
  });
  
  // Leave lobby
  socket.on('leaveLobby', () => {
    socket.leave('lobby');
    console.log('Client left lobby');
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Export for testing
module.exports = { app, server, io };
 