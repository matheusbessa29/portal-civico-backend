import { getPool, closePool } from '../config/database.config';

async function reset() {
    console.log('⚠️  WARNING: This will delete all data from the database!\n');

    const pool = getPool();

    try {
        console.log('🗑️  Dropping all tables...\n');

        // Drop tables in reverse order of creation (respecting foreign keys)
        const dropSQL = `
            DROP TABLE IF EXISTS summaries CASCADE;
            DROP TABLE IF EXISTS sources CASCADE;
            DROP TABLE IF EXISTS votes CASCADE;
            DROP TABLE IF EXISTS executive_acts CASCADE;
            DROP TABLE IF EXISTS projects CASCADE;
            DROP TABLE IF EXISTS attendance CASCADE;
            DROP TABLE IF EXISTS legislative_sessions CASCADE;
            DROP TABLE IF EXISTS politicians CASCADE;
        `;

        // Execute each statement separately since we're using IF EXISTS
        const statements = dropSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            await pool.query(statement);
        }

        console.log('✅ All tables dropped successfully!\n');
        console.log('✨ Database reset completed. Ready for new migrations.\n');

    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    } finally {
        await closePool();
    }
}

reset();
