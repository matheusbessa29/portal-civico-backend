import { getPool, closePool, testConnection } from '../config/database.config';

const sql = `
-- ========================================
-- TABLES FOR PORTAL CÍVICO
-- ========================================

-- Politicians (Vereadores + Prefeito)
CREATE TABLE IF NOT EXISTS politicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL, -- 'vereador' ou 'prefeito'
    party VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(20),
    photo_url TEXT,
    birth_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Legislative Sessions (Sessões da Câmara)
CREATE TABLE IF NOT EXISTS legislative_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_number VARCHAR(50) NOT NULL,
    session_date DATE NOT NULL,
    session_type VARCHAR(100), -- 'ordinária', 'extraordinária', etc
    status VARCHAR(50), -- 'scheduled', 'completed', 'cancelled'
    description TEXT,
    source_url TEXT,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_number)
);

-- Attendance (Presença em sessões)
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES legislative_sessions(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'presente', 'ausente', 'justificado', 'licença'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(politician_id, session_id)
);

-- Projects (Projetos de Lei)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_number VARCHAR(50) NOT NULL,
    author_id UUID NOT NULL REFERENCES politicians(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50), -- 'apresentado', 'em tramitação', 'aprovado', 'rejeitado', 'arquivo'
    project_type VARCHAR(100), -- 'Lei', 'Moção', 'Parecer', etc
    presentation_date DATE,
    theme VARCHAR(100), -- 'saúde', 'educação', 'urbanismo', etc
    source_url TEXT,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_number)
);

-- Votes (Votações em projetos)
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    vote VARCHAR(50) NOT NULL, -- 'sim', 'não', 'abstenção'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, politician_id)
);

-- Executive Acts (Decretos e Atos do Prefeito)
CREATE TABLE IF NOT EXISTS executive_acts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    act_number VARCHAR(50) NOT NULL,
    act_type VARCHAR(100) NOT NULL, -- 'decreto', 'portaria', 'resolução'
    author_id UUID REFERENCES politicians(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    publication_date DATE NOT NULL,
    source_url TEXT,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(act_number)
);

-- Sources (Rastreamento de fontes de dados)
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL, -- 'politician', 'project', 'executive_act', etc
    entity_id UUID NOT NULL,
    source_url TEXT NOT NULL,
    source_name VARCHAR(255),
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_hash VARCHAR(64), -- hash do conteúdo coletado para auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Summaries (Resumos gerados por IA)
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL, -- 'project', 'executive_act', etc
    entity_id UUID NOT NULL,
    summary_text TEXT NOT NULL,
    generated_by VARCHAR(100), -- 'ai_model_v1', etc
    is_reviewed BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES politicians(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_politicians_position ON politicians(position);
CREATE INDEX IF NOT EXISTS idx_politicians_is_active ON politicians(is_active);
CREATE INDEX IF NOT EXISTS idx_legislative_sessions_date ON legislative_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_politician ON attendance(politician_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_projects_author ON projects(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_theme ON projects(theme);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(presentation_date);
CREATE INDEX IF NOT EXISTS idx_votes_project ON votes(project_id);
CREATE INDEX IF NOT EXISTS idx_votes_politician ON votes(politician_id);
CREATE INDEX IF NOT EXISTS idx_executive_acts_author ON executive_acts(author_id);
CREATE INDEX IF NOT EXISTS idx_executive_acts_date ON executive_acts(publication_date);
CREATE INDEX IF NOT EXISTS idx_sources_entity ON sources(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_summaries_entity ON summaries(entity_type, entity_id);
`;

async function migrate() {
    console.log('🚀 Starting database migration...\n');

    const pool = getPool();

    try {
        // Test connection first
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('Failed to connect to database');
        }

        console.log('\n📋 Applying migrations...\n');

        // Execute migration
        await pool.query(sql);

        console.log('✅ Migration completed successfully!\n');
        console.log('📊 Tables created:');
        console.log('  - politicians');
        console.log('  - legislative_sessions');
        console.log('  - attendance');
        console.log('  - projects');
        console.log('  - votes');
        console.log('  - executive_acts');
        console.log('  - sources');
        console.log('  - summaries');
        console.log('\n✨ Database schema is ready!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await closePool();
    }
}

migrate();
