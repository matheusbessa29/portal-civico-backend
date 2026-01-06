import { getPool, closePool } from '../config/database.config';

async function seed() {
    console.log('🌱 Starting database seeding...\n');

    const pool = getPool();

    try {
        console.log('📊 Inserting sample data...\n');

        // Insert sample politicians
        const politiciansResult = await pool.query(`
            INSERT INTO politicians (name, position, party, email, phone, is_active)
            VALUES
                ('João Silva', 'vereador', 'PSDB', 'joao.silva@email.com', '(13) 99999-1111', true),
                ('Maria Santos', 'vereador', 'PT', 'maria.santos@email.com', '(13) 99999-2222', true),
                ('Carlos Oliveira', 'vereador', 'MDB', 'carlos.oliveira@email.com', '(13) 99999-3333', true),
                ('Ana Costa', 'vereador', 'DEM', 'ana.costa@email.com', '(13) 99999-4444', true),
                ('Roberto Ferreira', 'vereador', 'PDT', 'roberto.ferreira@email.com', '(13) 99999-5555', true),
                ('Dr. Rogério Mendes', 'prefeito', 'PSD', 'prefeito@email.com', '(13) 99999-0000', true)
            RETURNING id, name
        `);
        const politicians = politiciansResult.rows;
        console.log(`✅ Created ${politicians.length} politicians`);

        // Insert sample legislative sessions
        const sessionsResult = await pool.query(`
            INSERT INTO legislative_sessions (session_number, session_date, session_type, status, description)
            VALUES
                ('001/2025', '2025-01-15', 'ordinária', 'completed', 'Sessão ordinária da Câmara'),
                ('002/2025', '2025-01-22', 'ordinária', 'completed', 'Sessão ordinária da Câmara'),
                ('003/2025', '2025-02-05', 'ordinária', 'scheduled', 'Sessão ordinária da Câmara'),
                ('004/2025', '2025-02-19', 'extraordinária', 'scheduled', 'Sessão extraordinária para votação especial')
            RETURNING id, session_number
        `);
        const sessions = sessionsResult.rows;
        console.log(`✅ Created ${sessions.length} legislative sessions`);

        // Insert sample attendance
        const attendanceInserts = politicians.slice(0, 5).flatMap(politician =>
            sessions.slice(0, 2).map(session => ({
                politician_id: politician.id,
                session_id: session.id,
                status: Math.random() > 0.2 ? 'presente' : 'ausente'
            }))
        );

        if (attendanceInserts.length > 0) {
            for (const attendance of attendanceInserts) {
                await pool.query(
                    'INSERT INTO attendance (politician_id, session_id, status) VALUES ($1, $2, $3)',
                    [attendance.politician_id, attendance.session_id, attendance.status]
                );
            }
            console.log(`✅ Created ${attendanceInserts.length} attendance records`);
        }

        // Insert sample projects
        const projectsResult = await pool.query(`
            INSERT INTO projects (project_number, author_id, title, description, status, project_type, presentation_date, theme)
            VALUES
                ('PL-001/2025', $1, 'Lei de Proteção Ambiental', 'Projeto de lei para aumentar proteção ambiental em áreas de mangue', 'em tramitação', 'Lei', '2025-01-10', 'meio ambiente'),
                ('PL-002/2025', $2, 'Programa de Saúde Pública', 'Ampliação do programa de saúde pública municipal', 'aprovado', 'Lei', '2025-01-12', 'saúde'),
                ('PL-003/2025', $3, 'Reforma Educacional', 'Modernização das estruturas educacionais', 'em tramitação', 'Lei', '2025-01-14', 'educação'),
                ('MOC-001/2025', $4, 'Moção de Aplauso', 'Moção de aplauso para universidade local', 'apresentado', 'Moção', '2025-01-16', 'educação')
            RETURNING id, project_number
        `, [politicians[0].id, politicians[1].id, politicians[2].id, politicians[3].id]);
        const projects = projectsResult.rows;
        console.log(`✅ Created ${projects.length} projects`);

        // Insert sample votes
        const votesInserts = projects.slice(0, 2).flatMap(project =>
            politicians.slice(0, 5).map(politician => ({
                project_id: project.id,
                politician_id: politician.id,
                vote: Math.random() > 0.3 ? 'sim' : (Math.random() > 0.5 ? 'não' : 'abstenção')
            }))
        );

        if (votesInserts.length > 0) {
            for (const vote of votesInserts) {
                await pool.query(
                    'INSERT INTO votes (project_id, politician_id, vote) VALUES ($1, $2, $3)',
                    [vote.project_id, vote.politician_id, vote.vote]
                );
            }
            console.log(`✅ Created ${votesInserts.length} votes`);
        }

        // Insert sample executive acts
        const actsResult = await pool.query(`
            INSERT INTO executive_acts (act_number, act_type, author_id, title, description, publication_date)
            VALUES
                ('DECRETO-001/2025', 'decreto', $1, 'Decreto de Reforma Administrativa', 'Reorganização da administração pública municipal', '2025-01-08'),
                ('PORTARIA-001/2025', 'portaria', $1, 'Portaria de Nomeação', 'Nomeação de novos servidores públicos', '2025-01-09'),
                ('DECRETO-002/2025', 'decreto', $1, 'Decreto de Recursos', 'Alocação de recursos para saúde pública', '2025-01-13')
            RETURNING id, act_number
        `, [politicians[5].id]);
        const acts = actsResult.rows;
        console.log(`✅ Created ${acts.length} executive acts`);

        // Insert sample sources
        const sourcesInserts = [
            ...politicians.map(p => ({
                entity_type: 'politician',
                entity_id: p.id,
                source_url: 'https://camarasantos.sp.gov.br/vereadores',
                source_name: 'Câmara Municipal de Santos'
            })),
            ...projects.map(p => ({
                entity_type: 'project',
                entity_id: p.id,
                source_url: 'https://camarasantos.sp.gov.br/projetos',
                source_name: 'Câmara Municipal de Santos'
            })),
            ...acts.map(a => ({
                entity_type: 'executive_act',
                entity_id: a.id,
                source_url: 'https://diariooficial.santos.sp.gov.br',
                source_name: 'Diário Oficial de Santos'
            }))
        ];

        for (const source of sourcesInserts) {
            await pool.query(
                'INSERT INTO sources (entity_type, entity_id, source_url, source_name) VALUES ($1, $2, $3, $4)',
                [source.entity_type, source.entity_id, source.source_url, source.source_name]
            );
        }
        console.log(`✅ Created ${sourcesInserts.length} source records`);

        console.log('\n✨ Database seeding completed successfully!\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await closePool();
    }
}

seed();
