# 🗺️ Roadmap Técnico Detalhado - Portal Cívico Santos

Vou estruturar um roadmap realista e executável, dividido em fases claras com entregas incrementais.

---

## 📋 Premissas e Contexto

**Equipe assumida:** 1 desenvolvedor full-stack

**Stack confirmado:** Node.js + TypeScript + PostgreSQL + Redis + React

**Escopo MVP:** Vereadores + Prefeito de Santos/SP

**Prazo alvo MVP:** 8-10 semanas

---

## 🎯 FASE 0: Fundação (Semana 1)

**Objetivo:** Infraestrutura básica funcionando

### Sprint 0.1: Setup de Ambiente (2 dias)

- [ ]  Repositório Git estruturado (monorepo ou separado)
- [ ]  Docker Compose com:
    - PostgreSQL 15
    - Redis 7
    - pgAdmin (opcional)
- [ ]  Variáveis de ambiente (.env.example)
- [ ]  Scripts de inicialização
- [ ]  README com instruções

**Entrega:** `docker-compose up` funciona e cria DBs

---

### Sprint 0.2: Schema de Banco de Dados (3 dias)

- [ ]  Setup de migrations (TypeORM ou Knex)
- [ ]  Criar tabelas core:
    - `politicians`
    - `source_references`
    - `data_versions_history`
    - `collection_logs`
- [ ]  Índices básicos
- [ ]  Seeds com dados mock (3 vereadores fake)
- [ ]  Script de reset do banco

**Entrega:** Banco populado com dados de teste

**Arquivo:** `migrations/001_initial_schema.sql`

---

## 🔍 FASE 1: Coleta Básica (Semanas 2-3)

**Objetivo:** Coletar lista de vereadores + dados básicos

### Sprint 1.1: Collector de Vereadores (5 dias)

### Dia 1-2: Base Collector + Infraestrutura

- [ ]  Classe abstrata `BaseCollector`
- [ ]  Interface `CollectorResult`
- [ ]  Sistema de logs estruturado (Winston)
- [ ]  Gerenciamento de erros
- [ ]  Retry automático (3 tentativas)

**Entrega:** Framework de coleta reutilizável

---

### Dia 3-4: Santos Câmara Collector (Vereadores)

- [ ]  Implementar `SantosCamaraCollector`
- [ ]  Scraping de https://www.camarasantos.sp.gov.br/gabinetes-dos-vereadores
- [ ]  Extrair: nome, partido, email, telefone
- [ ]  Validação com Zod schema
- [ ]  Testes unitários básicos

**Entrega:** 21 vereadores coletados via script manual

**Comando:** `npm run collect:vereadores`

---

### Dia 5: Persistência e Auditoria

- [ ]  Repository pattern para `Politician`
- [ ]  Salvar `source_reference` para cada vereador
- [ ]  Hash MD5 de conteúdo para detectar mudanças
- [ ]  Atualizar apenas se dados mudaram
- [ ]  Log de coleta em `collection_logs`

**Entrega:** Dados no banco com rastreabilidade completa

---

### Sprint 1.2: Dados do Prefeito (2 dias)

### Tarefa única

- [ ]  Buscar dados oficiais do prefeito Rogério Santos
- [ ]  Inserir manualmente (sem collector por enquanto)
- [ ]  Marcar `role = 'PREFEITO'`
- [ ]  Vincular a município Santos

**Entrega:** 1 prefeito + 21 vereadores no banco

---

### Sprint 1.3: Sistema de Agendamento (3 dias)

### Implementação

- [ ]  Setup Bull (filas Redis)
- [ ]  Job `CollectVereadoresJob`
- [ ]  Cron diário (3h da manhã)
- [ ]  Dashboard Bull Board (monitoramento)
- [ ]  Alertas em caso de falha (console por enquanto)

**Entrega:** Coleta automática funcionando

**Teste:** Forçar falha e verificar retry

---

## 📰 FASE 2: Diário Oficial (Semanas 4-5)

**Objetivo:** Coletar e parsear decretos do prefeito

### Sprint 2.1: Download de PDFs (3 dias)

### Dia 1-2: Collector Base

- [ ]  Implementar `SantoDiarioCollector`
- [ ]  Download PDF via URL padrão
- [ ]  Salvar PDF bruto em `/storage/diarios/YYYY-MM-DD.pdf`
- [ ]  Metadata: data publicação, tamanho arquivo, hash
- [ ]  Source reference com link para DO online

**Entrega:** 5 PDFs baixados e salvos

---

### Dia 3: Parsing de Texto

- [ ]  Extrair texto com `pdf-parse`
- [ ]  Fallback OCR com Tesseract (se falhar)
- [ ]  Salvar texto bruto em `source_references.raw_data`
- [ ]  Validar qualidade (mínimo 100 caracteres)

**Entrega:** Texto extraído de 5 edições

---

### Sprint 2.2: Parsing de Decretos (4 dias)

### Dia 1-2: Regex e Estruturação

- [ ]  Identificar padrão: "DECRETO Nº XXX/YYYY"
- [ ]  Regex para extrair:
    - Número
    - Data
    - Ementa/Resumo
    - Texto completo
- [ ]  Testes com 10 decretos reais

**Entrega:** Parser funcionando em 90% dos casos

---

### Dia 3: Normalização

- [ ]  Criar tabela `executive_acts`
- [ ]  Processor `ExecutiveActProcessor`
- [ ]  Vincular a `politician_id` (prefeito)
- [ ]  Classificar tipo: DECRETO, PORTARIA, NOMEACAO
- [ ]  Detectar duplicatas por número

**Entrega:** Decretos normalizados no banco

---

### Dia 4: Pipeline Completo

- [ ]  Job `CollectDiarioJob` (diário, 14h30)
- [ ]  Fluxo: Download → Parse → Normalize → Persist
- [ ]  Log de cada etapa
- [ ]  Tratamento de feriados (pular coleta)

**Entrega:** Pipeline automático funcionando

---

### Sprint 2.3: Classificação Temática Básica (3 dias)

### Implementação

- [ ]  Lista de palavras-chave por tema:
    - SAUDE: "saúde", "hospital", "UBS", "vacina"
    - EDUCACAO: "educação", "escola", "professor"
    - URBANISMO: "obra", "pavimentação", "trânsito"
    - MEIO_AMBIENTE: "ambiental", "lixo", "reciclagem"
    - ORCAMENTO: "crédito", "orçamento", "suplementar"
- [ ]  Algoritmo de scoring (quantas keywords aparecem)
- [ ]  Campo JSONB `themes: string[]` em `executive_acts`
- [ ]  Testes com 20 decretos manualmente classificados

**Entrega:** 70%+ de acurácia em classificação

---

## 📜 FASE 3: Projetos Legislativos (Semanas 6-7)

**Objetivo:** Coletar projetos de lei dos vereadores

### Sprint 3.1: Reverse Engineering (2 dias)

### Investigação Manual

- [ ]  Acessar https://legislativo.camarasantos.sp.gov.br/
- [ ]  Testar sistema de busca
- [ ]  Inspecionar Network tab (DevTools)
- [ ]  Identificar endpoints AJAX (se houver)
- [ ]  Documentar estrutura de paginação
- [ ]  Identificar seletores CSS para dados

**Entrega:** Documento técnico com especificação

---

### Sprint 3.2: Collector de Projetos (5 dias)

### Dia 1-2: Scraping Base

- [ ]  Implementar `SantosLegislativeCollector`
- [ ]  Puppeteer (headless Chrome) se necessário
- [ ]  Buscar últimos 50 projetos
- [ ]  Extrair metadados básicos

**Entrega:** Lista de 50 projetos brutos

---

### Dia 3-4: Parsing Detalhado

- [ ]  Extrair campos:
    - `project_number` (ex: "257/2024")
    - `project_type` (LEI, LEI_COMPLEMENTAR)
    - `title`
    - `summary`
    - `author` (nome do vereador)
    - `submission_date`
    - `status`
- [ ]  Validação de schema
- [ ]  Matching de autor com tabela `politicians`

**Entrega:** Projetos estruturados

---

### Dia 5: Persistência

- [ ]  Criar tabela `projects`
- [ ]  Repository `ProjectRepository`
- [ ]  Vincular `author_politician_id`
- [ ]  Source reference
- [ ]  Detectar duplicatas por número+ano

**Entrega:** 50 projetos no banco com autores vinculados

---

### Sprint 3.3: Classificação Temática de Projetos (3 dias)

### Implementação

- [ ]  Reutilizar keywords de decretos
- [ ]  Expandir lista (analisar 30 projetos reais)
- [ ]  Classificar título + resumo
- [ ]  Campo `themes: string[]`
- [ ]  Validar com 20 projetos manualmente

**Entrega:** Classificação funcional

---

## 🏛️ FASE 4: Sessões e Presença (Semana 8)

**Objetivo:** Calcular taxa de presença dos vereadores

### Sprint 4.1: Sessões Legislativas (3 dias)

### Investigação + Coleta

- [ ]  Identificar onde ficam dados de sessões no site
- [ ]  Implementar coleta de:
    - Data da sessão
    - Tipo (ORDINARIA, EXTRAORDINARIA)
    - Pauta/Agenda
- [ ]  Criar tabela `legislative_sessions`
- [ ]  Coletar últimas 20 sessões

**Entrega:** 20 sessões no banco

---

### Sprint 4.2: Lista de Presença (4 dias)

### Dia 1-2: Coleta

- [ ]  Identificar fonte de dados (ata? lista publicada?)
- [ ]  Implementar scraping de presença
- [ ]  Criar tabela `attendance`
- [ ]  Vincular `politician_id` + `session_id`

**Entrega:** Presença de 20 sessões registrada

---

### Dia 3-4: Métricas

- [ ]  Service `AttendanceService`
- [ ]  Método `calculateAttendanceRate(politician_id, period)`
- [ ]  Agregar por mês/ano
- [ ]  Justificativas de ausência (se disponível)

**Entrega:** Taxa de presença calculada para todos os vereadores

---

## 🎨 FASE 5: API REST (Semana 9)

**Objetivo:** Expor dados via endpoints

### Sprint 5.1: Estrutura Base (2 dias)

### Setup

- [ ]  Express server
- [ ]  Rotas organizadas (`/api/v1/`)
- [ ]  Middleware de validação (express-validator)
- [ ]  Error handling global
- [ ]  Rate limiting (express-rate-limit)
- [ ]  CORS configurado

**Entrega:** Server rodando em `localhost:3000`

---

### Sprint 5.2: Endpoints Core (5 dias)

### Implementar:

**Políticos**

`GET /api/v1/politicians
GET /api/v1/politicians/:id
GET /api/v1/politicians/:id/attendance
GET /api/v1/politicians/:id/projects
GET /api/v1/politicians/:id/executive-acts`

**Projetos**

`GET /api/v1/projects
GET /api/v1/projects/:id`

**Sessões**

`GET /api/v1/sessions
GET /api/v1/sessions/:id/attendance`

**Metadados**

`GET /api/v1/metadata/themes
GET /api/v1/metadata/last-update`

### Para cada endpoint:

- [ ]  Controller
- [ ]  Service layer
- [ ]  Validação de params/query
- [ ]  Paginação (default 20, max 100)
- [ ]  Filtros básicos
- [ ]  Testes de integração
- [ ]  Documentação inline

**Entrega:** 10+ endpoints funcionais

---

### Sprint 5.3: Cache e Performance (2 dias)

### Otimizações

- [ ]  Redis cache para queries frequentes
- [ ]  TTL de 1 hora
- [ ]  Cache warming para homepage
- [ ]  Índices adicionais no PostgreSQL
- [ ]  Explain analyze nas queries lentas
- [ ]  Limit de 100 resultados por request

**Entrega:** Tempo de resposta < 200ms (p95)

---

## 🖥️ FASE 6: Frontend MVP (Semanas 10-11)

**Objetivo:** Interface funcional para usuários

### Sprint 6.1: Setup e Componentes Base (3 dias)

### Infraestrutura

- [ ]  Vite + React + TypeScript
- [ ]  Tailwind CSS
- [ ]  React Router
- [ ]  React Query (data fetching)
- [ ]  Axios configurado
- [ ]  API client tipado

**Componentes comuns:**

- [ ]  `<Header />`
- [ ]  `<Footer />`
- [ ]  `<Loading />`
- [ ]  `<ErrorMessage />`
- [ ]  `<Card />`

**Entrega:** Estrutura navegável

---

### Sprint 6.2: Página de Vereadores (4 dias)

### `/vereadores`

- [ ]  Grid de cards com foto/nome/partido
- [ ]  Filtro por partido
- [ ]  Busca por nome
- [ ]  Ordenação alfabética
- [ ]  Link para perfil individual

**Entrega:** Listagem funcional

---

### Sprint 6.3: Perfil do Político (5 dias)

### `/vereadores/:id` e `/prefeito`

**Seções:**

- [ ]  Header com foto, nome, partido, contato
- [ ]  **Presença**: Gráfico de taxa ao longo do tempo
- [ ]  **Projetos**: Lista com filtro por tema
- [ ]  **Atos** (só prefeito): Lista de decretos recentes
- [ ]  **Linha do tempo**: Atividades cronológicas
- [ ]  **Fonte dos dados**: Links para originais

**Componentes:**

- [ ]  `<AttendanceChart />` (Recharts)
- [ ]  `<ProjectList />`
- [ ]  `<ActivityTimeline />`
- [ ]  `<DataSourceBadge />`

**Entrega:** Perfil completo navegável

---

### Sprint 6.4: Filtros e Busca (2 dias)

### Funcionalidades

- [ ]  Dropdown multi-select de temas
- [ ]  Filtro por status (Em tramitação, Aprovado, etc)
- [ ]  Período de data (DateRangePicker)
- [ ]  Busca full-text em projetos
- [ ]  Query params na URL (shareable)

**Entrega:** Filtros funcionais

---

### Sprint 6.5: Exportação (2 dias)

### Implementar

- [ ]  Botão "Exportar CSV"
- [ ]  Botão "Exportar PDF"
- [ ]  Modal de seleção de campos
- [ ]  Geração no backend
- [ ]  Download via URL temporária

**Backend:**

- [ ]  `POST /api/v1/exports`
- [ ]  Geração com `fast-csv` e `pdfkit`
- [ ]  Storage em `/tmp` com expiração 1h

**Entrega:** Exportação funcional

---

## 🔧 FASE 7: Admin Panel (Semana 12)

**Objetivo:** Ferramentas internas de operação

### Sprint 7.1: Autenticação (2 dias)

### Simples e funcional

- [ ]  Login com usuário/senha (hardcoded no .env por enquanto)
- [ ]  JWT token
- [ ]  Middleware de autenticação
- [ ]  Rotas `/api/v1/admin/*` protegidas

**Entrega:** Login funcional

---

### Sprint 7.2: Dashboard Operacional (3 dias)

### `/admin`

**Painéis:**

- [ ]  Status das coletas (última execução, sucesso/falha)
- [ ]  Logs recentes (últimas 100 linhas)
- [ ]  Métricas básicas:
    - Total de políticos
    - Total de projetos
    - Total de decretos
    - % de completude de dados
- [ ]  Botão "Forçar coleta agora"

**Entrega:** Dashboard informativo

---

### Sprint 7.3: Ferramentas de Dados (2 dias)

### Funcionalidades

- [ ]  **Visualizar duplicatas** detectadas
- [ ]  **Merge manual** de registros duplicados
- [ ]  **Editar metadados** (foto, email - dados não oficiais)
- [ ]  **Invalidar cache** manualmente

**Entrega:** Ferramentas básicas de curadoria

---

## 🧪 FASE 8: Testes e Qualidade (Semana 13)

**Objetivo:** Garantir confiabilidade

### Sprint 8.1: Testes Automatizados (3 dias)

### Cobertura mínima

- [ ]  Unit tests para processors (>80% cobertura)
- [ ]  Integration tests para collectors
- [ ]  E2E tests para endpoints críticos
- [ ]  Setup CI/CD (GitHub Actions)
- [ ]  Testes rodam no PR

**Entrega:** Pipeline de testes funcionando

---

### Sprint 8.2: Qualidade de Dados (2 dias)

### Auditorias

- [ ]  Script de validação de completude
- [ ]  Verificar vereadores sem projetos (pode ser válido)
- [ ]  Verificar projetos sem autor (red flag)
- [ ]  Verificar source_references quebradas
- [ ]  Relatório de qualidade semanal

**Entrega:** Dashboard de qualidade

---

### Sprint 8.3: Documentação (2 dias)

### Artefatos

- [ ]  README completo
- [ ]  Guia de setup local
- [ ]  Documentação da API (Swagger/OpenAPI)
- [ ]  Guia de troubleshooting
- [ ]  Diagrama de arquitetura atualizado

**Entrega:** Docs publicadas

---

## 🚀 FASE 9: Deploy e Produção (Semana 14)

**Objetivo:** MVP acessível publicamente

### Sprint 9.1: Infraestrutura (3 dias)

### Opções avaliadas:

- **Render** (simples, free tier)
- **Railway** (bom custo/benefício)
- **DigitalOcean** (mais controle)

### Setup:

- [ ]  Servidor web (backend)
- [ ]  Banco PostgreSQL
- [ ]  Redis
- [ ]  Storage para PDFs (S3 ou equivalente)
- [ ]  Domínio configurado
- [ ]  HTTPS (Let's Encrypt)

**Entrega:** Ambiente de produção funcionando

---

### Sprint 9.2: Monitoramento (2 dias)

### Ferramentas

- [ ]  Logs centralizados (Logtail ou similar)
- [ ]  Uptime monitoring (UptimeRobot)
- [ ]  Error tracking (Sentry)
- [ ]  Alertas via email
- [ ]  Dashboard de métricas (Grafana ou similar)

**Entrega:** Observabilidade básica

---

### Sprint 9.3: Otimizações Finais (2 dias)

### Checklist pré-lançamento

- [ ]  Minificação de assets
- [ ]  CDN para frontend (Cloudflare)
- [ ]  Compression (gzip)
- [ ]  Security headers
- [ ]  Rate limiting agressivo
- [ ]  Backup automático do banco (diário)
- [ ]  Testes de carga (100 usuários simultâneos)

**Entrega:** MVP otimizado

---

## 📊 Resumo do Roadmap

| Fase | Duração | Objetivo Principal | Entrega Final |
| --- | --- | --- | --- |
| 0 | 1 sem | Fundação | Infra funcionando |
| 1 | 2 sem | Coleta básica | Vereadores no banco |
| 2 | 2 sem | Diário Oficial | Decretos parseados |
| 3 | 2 sem | Projetos | Projetos vinculados |
| 4 | 1 sem | Presença | Taxa calculada |
| 5 | 1 sem | API | Endpoints funcionais |
| 6 | 2 sem | Frontend | Interface navegável |
| 7 | 1 sem | Admin | Painel operacional |
| 8 | 1 sem | Qualidade | Testes + docs |
| 9 | 1 sem | Deploy | MVP público |

**Total: 14 semanas (~3,5 meses)**

---

## 🎯 Marcos de Validação

### Marco 1 (Semana 3): "Data Proof"

✅ 21 vereadores + 1 prefeito no banco

✅ Coleta automática funcionando

**Decisão:** Continuar ou ajustar estratégia

### Marco 2 (Semana 7): "Feature Complete"

✅ Todos os dados sendo coletados

✅ API funcional

**Decisão:** Pronto para frontend

### Marco 3 (Semana 12): "Beta Interno"

✅ Interface navegável

✅ Admin panel operacional

**Decisão:** Convidar beta testers (3-5 jornalistas)

### Marco 4 (Semana 14): "MVP Público"

✅ Produção estável

✅ Monitoramento ativo

**Decisão:** Lançamento público ou mais iteração

---

## 🔄 Iterações Pós-MVP

Após o lançamento, priorizar baseado em feedback:

1. **Melhorias de UX** (sempre tem)
2. **Novos filtros/visualizações** (pedidos de usuários)
3. **Dados adicionais** (votações, emendas)
4. **Expansion**: Guarujá, São Vicente (Fase 2 do roadmap original)

---

## ⚠️ Riscos e Contingências

| Risco | Mitigação | Plano B |
| --- | --- | --- |
| Site da Câmara muda estrutura | Alertas automáticos | Coleta manual temporária |
| Parsing de PDF falha muito | Tesseract OCR | Revisão manual assistida |
| Performance ruim | Cache agressivo | Materializar views |
| Bloqueio de IP | Rate limiting conservador | Rotação de IP (VPN) |
| Desenvolvedor doente/férias | Buffer de 2 semanas | Priorizar features core |