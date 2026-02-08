import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configuration
const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'election_db',
    user: process.env.POSTGRES_USER || 'election_admin',
    password: process.env.POSTGRES_PASSWORD || 'secure_password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('🗄️  Starting database migration...');

        // Read the schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');

        // Execute the schema
        await client.query(schema);

        console.log('✅ Database migration completed successfully!');
        console.log('\nCreated tables:');
        console.log('  - districts');
        console.log('  - elections');
        console.log('  - candidates');
        console.log('  - voters');
        console.log('  - voting_records');
        console.log('  - iot_terminals');
        console.log('  - admin_users');
        console.log('  - audit_logs');
        console.log('  - fraud_alerts');
        console.log('  - system_config');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigration().catch(console.error);
}

export default runMigration;
