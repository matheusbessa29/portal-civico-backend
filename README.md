# 🏛️ Portal Cívico - Backend

Sistema de coleta, normalização e exposição de dados oficiais de transparência cívica municipal.

**Município inicial:** Santos/SP  
**Stack:** Node.js + TypeScript + PostgreSQL + Redis

---

## 📋 Pré-requisitos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker + Docker Compose
- Git

---

## 🚀 Quick Start

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/portal-civico.git
cd portal-civico/backend
```

### 2. Instale dependências
```bash
npm install
```

### 3. Configure variáveis de ambiente
```bash
cp .env.example .env
# Edite .env com suas configurações locais
```

### 4. Inicie infraestrutura (Docker)
```bash
docker-compose up -d
```

Isso irá iniciar:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- pgAdmin (porta 5050) - opcional

### 5. Execute migrations
```bash
npm run db:migrate
```

### 6. (Opcional) Popule com dados de teste
```bash
npm run db:seed
```

### 7. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
src/
├── api/           # Controllers, routes, middlewares (Camada de Apresentação)
├── collectors/    # Web scrapers e parsers (Camada de Coleta)
├── processors/    # Normalização de dados (Camada de Processamento)
├── domain/        # Lógica de negócio, models, repositories (Camada de Domínio)
├── jobs/          # Background jobs (Bull Queue)
├── database/      # Migrations, seeds, conexões
├── config/        # Configurações
├── utils/         # Utilitários
└── server.ts      # Entry point
```

---

## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor em modo watch
npm run build        # Compila TypeScript
npm run start        # Inicia servidor de produção
```

### Banco de Dados
```bash
npm run db:migrate   # Executa migrations
npm run db:seed      # Popula dados de teste
npm run db:reset     # Reset completo (cuidado!)
```

### Coleta de Dados
```bash
npm run collect:vereadores   # Coleta lista de vereadores
npm run collect:diario       # Coleta Diário Oficial
```

### Testes
```bash
npm test             # Executa todos os testes
npm run test:coverage # Testes com cobertura
```

### Qualidade
```bash
npm run lint         # Verifica linting
npm run format       # Formata código
```

---

## 🗄️ Banco de Dados

### Acessar PostgreSQL via CLI
```bash
docker exec -it portal-civico-db psql -U portal_user -d portal_civico
```

### Acessar pgAdmin (Interface Web)
1. Abra http://localhost:5050
2. Login: `admin@portalcivico.local` / `admin`
3. Adicione servidor:
   - Host: `postgres`
   - Port: `5432`
   - Database: `portal_civico`
   - Username: `portal_user`
   - Password: `portal_pass_dev`

### Backup Manual
```bash
docker exec portal-civico-db pg_dump -U portal_user portal_civico > backup.sql
```

---

## 📊 Dados Coletados

### Fontes Oficiais (Santos/SP)

| Fonte | URL | Dados |
|-------|-----|-------|
| Câmara Municipal | camarasantos.sp.gov.br | Vereadores, Projetos, Sessões |
| Diário Oficial | diariooficial.santos.sp.gov.br | Decretos, Portarias |
| Portal Transparência | santos.sp.gov.br | Dados financeiros |

### Entidades Principais
- **Politicians** (Vereadores + Prefeito)
- **Projects** (Projetos de Lei)
- **Legislative Sessions** (Sessões da Câmara)
- **Attendance** (Presença dos vereadores)
- **Executive Acts** (Decretos do prefeito)

---

## 🔍 Exemplos de Uso

### Coletar vereadores manualmente
```bash
npm run collect:vereadores
```

### Consultar via psql
```sql
-- Listar todos os vereadores ativos
SELECT * FROM active_vereadores;

-- Taxa de presença de um vereador
SELECT 
    p.full_name,
    COUNT(CASE WHEN a.status = 'PRESENTE' THEN 1 END)::FLOAT / COUNT(*)::FLOAT * 100 as taxa_presenca
FROM politicians p
JOIN attendance a ON p.id = a.politician_id
WHERE p.id = 'uuid-do-vereador'
GROUP BY p.id;
```

---

## 🛠️ Troubleshooting

### Erro: "Connection refused" no PostgreSQL
```bash
# Verifique se containers estão rodando
docker-compose ps

# Reinicie containers
docker-compose restart
```

### Erro: "Port 5432 already in use"
Você tem outro PostgreSQL rodando localmente. Opções:
1. Pare o PostgreSQL local: `sudo service postgresql stop`
2. Mude a porta no docker-compose.yml: `"5433:5432"`

### Erro: Migrations não aplicadas
```bash
# Reset completo (CUIDADO: apaga todos os dados)
npm run db:reset
npm run db:migrate
npm run db:seed
```

### Logs dos collectors
```bash
# Ver logs em tempo real
tail -f logs/collection.log

# Ver últimas 100 linhas
tail -n 100 logs/collection.log
```

---

## 🧪 Testes

### Estrutura
```
tests/
├── unit/          # Testes unitários (funções isoladas)
├── integration/   # Testes de integração (banco, APIs)
└── e2e/           # Testes end-to-end (fluxo completo)
```

### Executar testes específicos
```bash
# Apenas unit tests
npm test -- tests/unit

# Apenas um arquivo
npm test -- tests/unit/processors/theme-classifier.test.ts

# Com watch mode
npm test -- --watch
```

---

## 📚 Documentação Adicional

- [Arquitetura Técnica](./docs/architecture.md)
- [Guia de Collectors](./docs/collectors.md)
- [API Reference](./docs/api.md)
- [Deploy](./docs/deploy.md)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Add: nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes

---

## 📧 Contato

- Email: contato@portalcivico.com.br
- Issues: https://github.com/seu-usuario/portal-civico/issues

---

## 🎯 Roadmap

- [x] Setup inicial
- [x] Coleta de vereadores
- [ ] Coleta de Diário Oficial
- [ ] Coleta de projetos
- [ ] Sistema de presença
- [ ] API REST
- [ ] Frontend
- [ ] Deploy em produção

---

## 📖 Documentação Detalhada

Para informações técnicas mais aprofundadas, consulte a pasta `docs/`:

- **[Viabilidade Técnica](./docs/viabilidade-tecnica.md)** - Validação completa das fontes de dados oficiais de Santos/SP, URLs testadas, estrutura de coleta e riscos identificados
- **[Roadmap Detalhado](./docs/roadmap.md)** - Planejamento completo de 14 semanas dividido em fases, sprints e marcos de validação
- **[MVP e Regra de Negócio](./docs/instrucoes-mvp.md)** - Instruções e regra de negócio do MVP do portal cívico.
---

**Versão:** 0.1.0
**Status:** Em desenvolvimento ativo 🚧