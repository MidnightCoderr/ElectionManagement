import { Sequelize } from 'sequelize';
import pg from 'pg';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Connection with Sequelize (ORM)
const sequelize = new Sequelize(
    process.env.POSTGRES_DB || 'election_db',
    process.env.POSTGRES_USER || 'election_admin',
    process.env.POSTGRES_PASSWORD || 'secure_password',
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
const mongoURI = `mongodb://${process.env.MONGO_USER || 'election_admin'}:${process.env.MONGO_PASSWORD || 'secure_password'}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DB || 'election_logs'}?authSource=admin`;

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
export const initializeDatabases = async () => {
    console.log('🔌 Initializing database connections...');

    await testPostgresConnection();
    await connectMongoDB();
    await connectRedis();

    console.log('✅ All database connections established');
};

// Close all connections gracefully
export const closeDatabases = async () => {
    console.log('🔌 Closing database connections...');

    await sequelize.close();
    await mongoose.connection.close();
    await redisClient.quit();

    console.log('✅ All database connections closed');
};

export { sequelize, mongoose, redisClient };
export default {
    sequelize,
    mongoose,
    redisClient,
    initializeDatabases,
    closeDatabases,
};
