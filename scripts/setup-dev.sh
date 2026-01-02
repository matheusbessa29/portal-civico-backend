#!/bin/bash

# ========================================
# Portal Cívico - Setup Desenvolvimento
# ========================================

set -e  # Exit on error

echo "🏛️  Portal Cívico - Setup de Desenvolvimento"
echo "=============================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função de log
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar Node.js
echo "1️⃣  Verificando Node.js..."
if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado. Instale Node.js >= 20.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    log_error "Node.js versão $NODE_VERSION detectada. Necessário >= 20.0.0"
    exit 1
fi

log_info "Node.js $(node -v) detectado"

# Verificar npm
echo ""
echo "2️⃣  Verificando npm..."
if ! command -v npm &> /dev/null; then
    log_error "npm não encontrado"
    exit 1
fi

log_info "npm $(npm -v) detectado"

# Verificar Docker
echo ""
echo "3️⃣  Verificando Docker..."
if ! command -v docker &> /dev/null; then
    log_error "Docker não encontrado. Instale Docker Desktop"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker não está rodando. Inicie Docker Desktop"
    exit 1
fi

log_info "Docker $(docker --version | cut -d' ' -f3 | sed 's/,//') detectado"

# Verificar Docker Compose
echo ""
echo "4️⃣  Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose não encontrado"
    exit 1
fi

log_info "Docker Compose detectado"

# Criar estrutura de pastas
echo ""
echo "5️⃣  Criando estrutura de pastas..."

mkdir -p src/api/{controllers,middlewares,routes,validators}
mkdir -p src/collectors/types
mkdir -p src/processors/utils
mkdir -p src/domain/{models,repositories,services,types}
mkdir -p src/jobs/types
mkdir -p src/database/{migrations,seeds}
mkdir -p src/config
mkdir -p src/utils
mkdir -p src/scripts

mkdir -p tests/{unit/{processors,services,utils},integration/{collectors,repositories,api},e2e/api,fixtures/{html-samples,pdf-samples}}

mkdir -p storage/{diarios,snapshots}
mkdir -p logs

# Criar .gitkeep para pastas vazias
touch storage/.gitkeep
touch logs/.gitkeep

log_info "Estrutura de pastas criada"

# Instalar dependências
echo ""
echo "6️⃣  Instalando dependências..."
if [ -f "package.json" ]; then
    npm install
    log_info "Dependências instaladas"
else
    log_warn "package.json não encontrado. Execute manualmente: npm install"
fi

# Configurar .env
echo ""
echo "7️⃣  Configurando variáveis de ambiente..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        log_info "Arquivo .env criado a partir de .env.example"
        log_warn "IMPORTANTE: Edite o arquivo .env com suas configurações"
    else
        log_error ".env.example não encontrado"
    fi
else
    log_info ".env já existe"
fi

# Iniciar Docker Compose
echo ""
echo "8️⃣  Iniciando containers Docker..."
docker-compose up -d

# Aguardar PostgreSQL ficar pronto
echo ""
echo "9️⃣  Aguardando PostgreSQL ficar pronto..."
sleep 5

MAX_RETRIES=30
RETRY_COUNT=0

while ! docker exec portal-civico-db pg_isready -U portal_user -d portal_civico &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        log_error "PostgreSQL não ficou pronto após 30 segundos"
        exit 1
    fi
    echo -n "."
    sleep 1
done

echo ""
log_info "PostgreSQL está pronto"

# Executar migrations
echo ""
echo "🔟 Executando migrations..."
if [ -f "src/database/migrate.ts" ]; then
    npm run db:migrate
    log_info "Migrations executadas"
else
    log_warn "Script de migration não encontrado. Execute manualmente depois: npm run db:migrate"
fi

# Executar seeds (opcional)
echo ""
read -p "Deseja popular o banco com dados de teste? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    if [ -f "src/database/seed.ts" ]; then
        npm run db:seed
        log_info "Seeds executadas"
    else
        log_warn "Script de seed não encontrado"
    fi
fi

# Resumo final
echo ""
echo "=============================================="
echo "✅ Setup concluído com sucesso!"
echo "=============================================="
echo ""
echo "📋 Serviços disponíveis:"
echo "   • PostgreSQL: localhost:5432"
echo "   • Redis: localhost:6379"
echo "   • pgAdmin: http://localhost:5050"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Edite o arquivo .env se necessário"
echo "   2. Execute: npm run dev"
echo "   3. Acesse: http://localhost:3000"
echo ""
echo "📚 Comandos úteis:"
echo "   • npm run dev           - Iniciar servidor"
echo "   • npm run collect:vereadores - Coletar vereadores"
echo "   • npm test              - Executar testes"
echo "   • docker-compose logs -f - Ver logs dos containers"
echo ""

# Exibir status dos containers
echo "📊 Status dos containers:"
docker-compose ps

echo ""
log_info "Tudo pronto! Happy coding! 🎉"