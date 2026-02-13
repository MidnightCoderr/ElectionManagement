import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabases, closeDatabases } from './db/index.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes.js';
import voteRoutes from './routes/vote.routes.js';
import electionRoutes from './routes/election.routes.js';
import candidateRoutes from './routes/candidate.routes.js';
import resultsRoutes from './routes/results.routes.js';
import auditRoutes from './routes/audit.routes.js';
import voterRoutes from './routes/voter.routes.js';

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
import logger from './utils/logger.js';

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

export default app;
