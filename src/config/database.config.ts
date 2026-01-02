import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig extends PoolConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

export const databaseConfig: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portal_civico',
    user: process.env.DB_USER || 'portal_user',
    password: process.env.DB_PASSWORD || 'portal_pass_dev',

    // Pool configuration
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '10'),

    // Connection timeout
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,

    // SSL configuration (production)
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false,
};

// Singleton pool instance
let pool: Pool | null = null;

export function getPool(): Pool {
    if (!pool) {
        pool = new Pool(databaseConfig);

        // Event handlers
        pool.on('connect', () => {
            console.log('✓ Database connection established');
        });

        pool.on('error', (err) => {
            console.error('✗ Unexpected database error:', err);
            process.exit(-1);
        });
    }

    return pool;
}

export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('✓ Database pool closed');
    }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
    try {
        const pool = getPool();
        const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✓ Database connection test successful');
        console.log(`  Time: ${result.rows[0].current_time}`);
        console.log(`  PostgreSQL: ${result.rows[0].pg_version.split(',')[0]}`);
        return true;
    } catch (error) {
        console.error('✗ Database connection test failed:', error);
        return false;
    }
}

export default {
    getPool,
    closePool,
    testConnection,
    config: databaseConfig,
};