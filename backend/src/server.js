const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { initializeDatabases, closeDatabases } = require('./db/index.js');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes.js');
const voteRoutes = require('./routes/vote.routes.js');
const electionRoutes = require('./routes/election.routes.js');
const candidateRoutes = require('./routes/candidate.routes.js');
const resultsRoutes = require('./routes/results.routes.js');
const auditRoutes = require('./routes/audit.routes.js');
const voterRoutes = require('./routes/voter.routes.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
import logger from '../utils/logger.js';

app.use((req, res, next) => {
  logger.info('API_REQUEST', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'election-management-api',
        version: '1.0.0',
    });
});

// Mount API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/votes', voteRoutes);
app.use('/api/v1/elections', electionRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/results', resultsRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/voters', voterRoutes);

// Mock blockchain route for Verification Portal demo
const blockchainMockRoutes = require('./routes/blockchain.mock.routes.js');
app.use('/api/blockchain', blockchainMockRoutes);

// API root endpoint
app.get('/api/v1', (req, res) => {
    res.json({
        message: 'Election Management System API v1',
        endpoints: {
            auth: '/api/v1/auth',
            votes: '/api/v1/votes',
            candidates: '/api/v1/candidates',
            elections: '/api/v1/elections',
        },
    });
});

// Error handling middleware
app.use((req, res, next) => {
  logger.info('API_REQUEST', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            status: 404,
            path: req.path,
        },
    });
});

// Initialize databases and start server
const startServer = async () => {
    try {
        // Connect to all databases
        await initializeDatabases();

        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`   Health check: http://localhost:${PORT}/health`);
            console.log(`   API endpoint: http://localhost:${PORT}/api/v1`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    await closeDatabases();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    await closeDatabases();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
