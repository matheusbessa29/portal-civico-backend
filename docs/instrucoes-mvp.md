# **📘 PROJECT INSTRUCTIONS — Portal Cívico (MVP Santos/SP)**

# **1. Finalidade do Projeto**

Este projeto tem como objetivo construir um portal cívico de transparência pública, focado inicialmente no município de Santos/SP.

O sistema deve centralizar, organizar e traduzir dados oficiais sobre a atuação de agentes públicos sem emitir opinião, ranking ou recomendação política.

O público-alvo inicial é B2B institucional:

- imprensa local
- ONGs
- universidades
- observatórios cívicos

# **2. Princípios Fundamentais (obrigatórios)**

- Neutralidade política absoluta
- Uso exclusivo de dados oficiais e públicos
- Transparência total das fontes
- Linguagem clara, não jurídica
- Sistema auditável e versionado
- Nenhuma inferência subjetiva sobre “bom” ou “mau” político

Se houver dúvida entre clareza e sofisticação, priorizar clareza.

# **3. Escopo do MVP (fixo)**

**3.1 Abrangência geográfica**

- Município de Santos / SP

**3.2 Cargos incluídos**

- Vereadores de Santos
- Prefeito de Santos

**3.3 Funcionalidades obrigatórias**

- Listagem de agentes públicos
- Página individual por agente contendo:
    - presença em sessões
    - projetos apresentados
    - votações (quando aplicável)
    - atos oficiais do Executivo (prefeito)
    - linha do tempo cronológica
    - resumo textual em linguagem simples
- 
- Filtro por tema (ex: saúde, educação, urbanismo)
- Exportação de dados (CSV e PDF)
- Área administrativa interna simples

**3.4 Fora de escopo**

- Rankings
- Notas
- Avaliações
- Opiniões
- Sugestão de voto
- Conteúdo editorial próprio

# **4. Fontes de Dados**

Utilizar somente fontes oficiais, tais como:

- Câmara Municipal de Santos
- Diário Oficial do Município de Santos
- Portal da Transparência municipal

Para cada dado apresentado, deve existir:

- fonte explícita
- data de coleta
- versão armazenada

# **5. Arquitetura Técnica (diretrizes)**

**Backend**

- Node.js + TypeScript
- API REST
- Separação clara de camadas:
    - coleta de dados
    - normalização
    - domínio
    - apresentação
- 
- Banco de dados relacional
- Cache para leitura
- Logs e versionamento de dados
- Arquitetura preparada para múltiplos municípios

**Frontend**

- React
- Interface web
- UX orientada a leitura, contexto e comparação
- Design neutro e informativo

# **6. Modelo Mental de Dados**

Entidades centrais esperadas:

- Politician
- LegislativeSession
- Attendance
- Project
- Vote
- ExecutiveAct
- Source
- Summary

Todos os dados devem:

- manter histórico
- permitir auditoria
- nunca sobrescrever informação oficial sem versionamento

# **7. Uso de IA no Projeto**

A IA deve ser usada apenas como ferramenta assistiva, para:

- resumir textos oficiais
- classificar temas
- organizar informações

A IA não deve:

- emitir juízo de valor
- interpretar intenção política
- sugerir consequências eleitorais

Todo resumo deve ser:

- factual
- rastreável à fonte original
- revisável

# **8. Valor Comercial do MVP**

O MVP deve permitir:

- geração de relatórios institucionais
- exportação de dados para uso jornalístico
- economia de tempo para análise pública

O produto é um fornecedor de infraestrutura de dados, não um veículo de opinião.

# **9. Estratégia de Evolução (não implementar agora)**

- Expansão para Baixada Santista
- Expansão para nível estadual (SP)
- Exposição de API para parceiros institucionais

# **10. Regra Final**

Sempre que houver dúvida de decisão técnica ou funcional, priorizar:

neutralidade + auditabilidade + simplicidade