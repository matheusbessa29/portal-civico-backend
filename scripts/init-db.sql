-- ========================================
-- Portal Cívico - Inicialização do Banco
-- ========================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar schema (opcional, por enquanto usamos public)
-- CREATE SCHEMA IF NOT EXISTS portal_civico;

-- ========================================
-- MUNICÍPIOS (preparado para multi-city)
-- ========================================
CREATE TABLE IF NOT EXISTS municipalities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    ibge_code VARCHAR(7) UNIQUE,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Inserir Santos
INSERT INTO municipalities (name, state, ibge_code) 
VALUES ('Santos', 'SP', '3548500')
ON CONFLICT (ibge_code) DO NOTHING;

-- ========================================
-- POLÍTICOS
-- ========================================
CREATE TABLE IF NOT EXISTS politicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id),
    
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('VEREADOR', 'PREFEITO')),
    party VARCHAR(50),
    
    term_start DATE NOT NULL,
    term_end DATE NOT NULL,
    
    photo_url TEXT,
    contact_email VARCHAR(200),
    contact_phone VARCHAR(50),
    office_location VARCHAR(200),
    
    -- Auditoria
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    data_version INTEGER NOT NULL DEFAULT 1,
    
    -- Índices
    CONSTRAINT unique_politician_term UNIQUE (full_name, municipality_id, term_start)
);

CREATE INDEX idx_politicians_role ON politicians(role);
CREATE INDEX idx_politicians_municipality ON politicians(municipality_id);
CREATE INDEX idx_politicians_name ON politicians USING gin (full_name gin_trgm_ops);

-- ========================================
-- REFERÊNCIAS DE FONTE (auditoria)
-- ========================================
CREATE TABLE IF NOT EXISTS source_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN (
        'CAMARA_SITE', 
        'DIARIO_OFICIAL', 
        'PORTAL_TRANSPARENCIA',
        'LEGISLATIVO_SYSTEM'
    )),
    source_url TEXT NOT NULL,
    
    capture_date TIMESTAMP NOT NULL DEFAULT NOW(),
    content_hash CHAR(64) NOT NULL, -- SHA256
    raw_data JSONB, -- Snapshot original
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_source_ref_hash ON source_references(content_hash);
CREATE INDEX idx_source_ref_type ON source_references(source_type);
CREATE INDEX idx_source_ref_date ON source_references(capture_date DESC);

-- ========================================
-- HISTÓRICO DE VERSÕES (auditoria)
-- ========================================
CREATE TABLE IF NOT EXISTS data_versions_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
        'POLITICIAN',
        'PROJECT',
        'SESSION',
        'ATTENDANCE',
        'VOTE',
        'EXECUTIVE_ACT'
    )),
    entity_id UUID NOT NULL,
    
    version_number INTEGER NOT NULL,
    changed_fields JSONB NOT NULL,
    previous_values JSONB,
    change_reason VARCHAR(100),
    
    changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    changed_by VARCHAR(100) DEFAULT 'system'
);

CREATE INDEX idx_versions_entity ON data_versions_history(entity_type, entity_id);
CREATE INDEX idx_versions_date ON data_versions_history(changed_at DESC);

-- ========================================
-- LOGS DE COLETA
-- ========================================
CREATE TABLE IF NOT EXISTS collection_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    collector_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PARTIAL')),
    
    items_collected INTEGER DEFAULT 0,
    items_new INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    
    error_message TEXT,
    execution_time_ms INTEGER,
    
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    
    metadata JSONB
);

CREATE INDEX idx_collection_logs_collector ON collection_logs(collector_name);
CREATE INDEX idx_collection_logs_status ON collection_logs(status);
CREATE INDEX idx_collection_logs_date ON collection_logs(started_at DESC);

-- ========================================
-- SESSÕES LEGISLATIVAS
-- ========================================
CREATE TABLE IF NOT EXISTS legislative_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id),
    
    session_number INTEGER NOT NULL,
    session_date DATE NOT NULL,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN (
        'ORDINARIA',
        'EXTRAORDINARIA',
        'SOLENE'
    )),
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'AGENDADA',
        'REALIZADA',
        'CANCELADA'
    )),
    
    agenda_summary TEXT,
    
    source_reference_id UUID REFERENCES source_references(id),
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_session UNIQUE (municipality_id, session_date, session_number)
);

CREATE INDEX idx_sessions_date ON legislative_sessions(session_date DESC);
CREATE INDEX idx_sessions_type ON legislative_sessions(session_type);
CREATE INDEX idx_sessions_municipality ON legislative_sessions(municipality_id);

-- ========================================
-- PRESENÇA EM SESSÕES
-- ========================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES legislative_sessions(id) ON DELETE CASCADE,
    
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'PRESENTE',
        'AUSENTE',
        'JUSTIFICADO'
    )),
    justification TEXT,
    
    source_reference_id UUID REFERENCES source_references(id),
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_attendance UNIQUE (politician_id, session_id)
);

CREATE INDEX idx_attendance_politician ON attendance(politician_id);
CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_status ON attendance(status);

-- ========================================
-- PROJETOS DE LEI
-- ========================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id),
    
    project_number VARCHAR(50) NOT NULL, -- "123/2024"
    project_type VARCHAR(30) NOT NULL CHECK (project_type IN (
        'LEI',
        'LEI_COMPLEMENTAR',
        'DECRETO_LEGISLATIVO',
        'EMENDA',
        'RESOLUCAO'
    )),
    
    title TEXT NOT NULL,
    summary TEXT,
    themes TEXT[], -- Array de temas: ['SAUDE', 'ORCAMENTO']
    
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'EM_TRAMITACAO',
        'APROVADO',
        'REJEITADO',
        'ARQUIVADO',
        'VETADO',
        'RETIRADO'
    )),
    
    author_politician_id UUID REFERENCES politicians(id),
    submission_date DATE NOT NULL,
    last_action_date DATE,
    
    source_reference_id UUID REFERENCES source_references(id),
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    data_version INTEGER NOT NULL DEFAULT 1,
    
    CONSTRAINT unique_project UNIQUE (municipality_id, project_number)
);

CREATE INDEX idx_projects_number ON projects(project_number);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_author ON projects(author_politician_id);
CREATE INDEX idx_projects_themes ON projects USING gin(themes);
CREATE INDEX idx_projects_submission ON projects(submission_date DESC);
CREATE INDEX idx_projects_municipality ON projects(municipality_id);
CREATE INDEX idx_projects_title ON projects USING gin (title gin_trgm_ops);

-- ========================================
-- VOTAÇÕES (para implementar depois)
-- ========================================
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    session_id UUID REFERENCES legislative_sessions(id),
    
    vote VARCHAR(20) NOT NULL CHECK (vote IN (
        'FAVORAVEL',
        'CONTRARIO',
        'ABSTENCAO',
        'AUSENTE'
    )),
    
    vote_date DATE NOT NULL,
    
    source_reference_id UUID REFERENCES source_references(id),
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_vote UNIQUE (project_id, politician_id, vote_date)
);

CREATE INDEX idx_votes_project ON votes(project_id);
CREATE INDEX idx_votes_politician ON votes(politician_id);
CREATE INDEX idx_votes_vote ON votes(vote);

-- ========================================
-- ATOS DO EXECUTIVO (Prefeito)
-- ========================================
CREATE TABLE IF NOT EXISTS executive_acts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality_id UUID NOT NULL REFERENCES municipalities(id),
    
    act_number VARCHAR(50) NOT NULL, -- "1234/2024"
    act_type VARCHAR(30) NOT NULL CHECK (act_type IN (
        'DECRETO',
        'PORTARIA',
        'NOMEACAO',
        'EXONERACAO',
        'CONVENIO'
    )),
    
    title TEXT NOT NULL,
    summary TEXT,
    themes TEXT[], -- Array de temas
    
    publication_date DATE NOT NULL,
    
    politician_id UUID NOT NULL REFERENCES politicians(id), -- Sempre o prefeito
    
    source_reference_id UUID REFERENCES source_references(id),
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    data_version INTEGER NOT NULL DEFAULT 1,
    
    CONSTRAINT unique_executive_act UNIQUE (municipality_id, act_number)
);

CREATE INDEX idx_executive_acts_number ON executive_acts(act_number);
CREATE INDEX idx_executive_acts_type ON executive_acts(act_type);
CREATE INDEX idx_executive_acts_politician ON executive_acts(politician_id);
CREATE INDEX idx_executive_acts_themes ON executive_acts USING gin(themes);
CREATE INDEX idx_executive_acts_date ON executive_acts(publication_date DESC);
CREATE INDEX idx_executive_acts_municipality ON executive_acts(municipality_id);

-- ========================================
-- RESUMOS (métricas calculadas)
-- ========================================
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
    
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Métricas calculadas
    attendance_rate DECIMAL(5,2),
    projects_submitted INTEGER DEFAULT 0,
    projects_approved INTEGER DEFAULT 0,
    votes_cast INTEGER DEFAULT 0,
    executive_acts_count INTEGER DEFAULT 0, -- Para prefeito
    
    summary_text TEXT, -- Texto em linguagem simples
    
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    data_version INTEGER NOT NULL DEFAULT 1,
    
    CONSTRAINT unique_summary UNIQUE (politician_id, period_start, period_end)
);

CREATE INDEX idx_summaries_politician ON summaries(politician_id);
CREATE INDEX idx_summaries_period ON summaries(period_start, period_end);

-- ========================================
-- FUNÇÕES E TRIGGERS
-- ========================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em tabelas relevantes
CREATE TRIGGER update_politicians_updated_at BEFORE UPDATE ON politicians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON legislative_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_executive_acts_updated_at BEFORE UPDATE ON executive_acts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View de vereadores ativos
CREATE OR REPLACE VIEW active_vereadores AS
SELECT 
    p.*,
    m.name as municipality_name
FROM politicians p
JOIN municipalities m ON p.municipality_id = m.id
WHERE p.role = 'VEREADOR'
  AND p.term_end >= CURRENT_DATE
ORDER BY p.full_name;

-- View de prefeitos ativos
CREATE OR REPLACE VIEW active_prefeitos AS
SELECT 
    p.*,
    m.name as municipality_name
FROM politicians p
JOIN municipalities m ON p.municipality_id = m.id
WHERE p.role = 'PREFEITO'
  AND p.term_end >= CURRENT_DATE;

-- View de projetos recentes
CREATE OR REPLACE VIEW recent_projects AS
SELECT 
    p.*,
    pol.full_name as author_name,
    pol.party as author_party,
    m.name as municipality_name
FROM projects p
LEFT JOIN politicians pol ON p.author_politician_id = pol.id
JOIN municipalities m ON p.municipality_id = m.id
WHERE p.submission_date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY p.submission_date DESC;

-- ========================================
-- GRANTS (se necessário)
-- ========================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO portal_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO portal_user;

-- ========================================
-- COMENTÁRIOS
-- ========================================
COMMENT ON TABLE politicians IS 'Políticos (vereadores e prefeitos) com mandatos ativos ou históricos';
COMMENT ON TABLE source_references IS 'Auditoria de onde cada dado foi coletado';
COMMENT ON TABLE data_versions_history IS 'Histórico de todas as mudanças em dados';
COMMENT ON TABLE collection_logs IS 'Log de execução dos collectors';

-- Finalizado
SELECT 'Database initialized successfully!' as status;