const { Sequelize } = require('sequelize');
const pg = require('pg');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').resolve(__dirname, '../../../.env') });

// PostgreSQL Connection with Sequelize (ORM)
const sequelize = new Sequelize(
    process.env.POSTGRES_DB || 'election_db',
    process.env.POSTGRES_USER || 'election_admin',
    process.env.POSTGRES_PASSWORD || 'changeme_secure_password',
    {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_PORT || 5432,
        dialect: 'postgres',
        dialectModule: pg,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 20,
            min: 5,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        },
    }
);

// MongoDB Connection with Mongoose
const mongoURI = process.env.MONGODB_URI || `mongodb://${process.env.MONGODB_USER || 'mongo_admin'}:${process.env.MONGODB_PASSWORD || 'changeme_mongo_password'}@${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DB || 'election_logs'}?authSource=admin`;

mongoose.set('strictQuery', false);

const connectMongoDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
};

// Redis Connection for Caching
const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    },
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected successfully'));

const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('❌ Redis connection error:', error.message);
    }
};

// Test PostgreSQL connection
const testPostgresConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected successfully');
    } catch (error) {
        console.error('❌ PostgreSQL connection error:', error.message);
        throw error;
    }
};

// Initialize all database connections
const initializeDatabases = async () => {
    console.log('🔌 Initializing database connections...');

    await testPostgresConnection();
    await connectMongoDB();
    await connectRedis();

    console.log('✅ All database connections established');
};

// Close all connections gracefully
const closeDatabases = async () => {
    console.log('🔌 Closing database connections...');

    await sequelize.close();
    await mongoose.connection.close();
    await redisClient.quit();

    console.log('✅ All database connections closed');
};

module.exports = {
    initializeDatabases,
    closeDatabases,
    sequelize,
    mongoose,
    redisClient
};
