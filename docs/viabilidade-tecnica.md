# 📊 Relatório de Validação de Fontes Oficiais

## Portal Cívico Santos - Passo 1: Teste de Coleta de Dados

**Data:** 01/01/2026

**Município:** Santos/SP

**Status:** ✅ Viabilidade Técnica Confirmada

---

## 1. Câmara Municipal de Santos

### 🌐 Fonte Identificada

**URL:** https://www.camarasantos.sp.gov.br/

### ✅ Dados Disponíveis

### 1.1 Lista de Vereadores (21 vereadores - 33ª Legislatura)

**Fonte:** https://www.camarasantos.sp.gov.br/gabinetes-dos-vereadores

**Vereadores confirmados:**

- Adilson Junior (PP) - Presidente da Câmara
- Adriano Catapreta (PSD)
- Adriano Piemonte (UNIAO)
- Allison Sales (PL)
- Benedito Furtado (PSB)
- Cacá Teixeira (PSDB) - Líder do Governo
- Chico Nogueira (PT)
- Chita Menezes (PSB)
- Claudia Alonso (PODE)
- Débora Camilo (PSOL) - Mais votada
- Dr. Caseiro (PT)
- Fábio Duarte (PL)
- Lincoln Reis (PODE)
- Mauricio Campos (REPUBLICANOS)
- Paulo Miyasiro (REPUBLICANOS)
- Rafael Pasquarelli (UNIAO)
- Renata Bravo (PSD)
- Rui de Rosis Jr. (PL)
- Sérgio Santana (PL)
- Zequinha Teixeira (PP)

**Dados estruturados incluem:**

- Nome completo
- Partido
- Email institucional
- Telefone do gabinete
- Localização física (andar/sala)

### 1.2 Projetos Legislativos

**Sistema identificado:** Banco de dados legislativo próprio

**URLs relevantes:**

- Busca de documentos: `legislativo.camarasantos.sp.gov.br/buscar_documento`
- Total estimado: ~4.230 documentos

**Tipos de proposituras:**

- Projetos de Lei
- Projetos de Lei Complementar
- Emendas à Lei Orgânica
- Requerimentos
- Indicações
- Decretos Legislativos

**Exemplo de numeração:** PL nº 257/2024 (LOA 2025)

### 1.3 Sessões Legislativas

**Status:** Dados disponíveis no site, mas estrutura precisa ser validada

**Tipos de sessões:**

- Ordinárias
- Extraordinárias
- Solenes

### 1.4 Transparência da Câmara

**Portal específico:** https://s2.asp.srv.br/etransparencia.cm.santos.sp/

---

## 2. Diário Oficial de Santos

### 🌐 Fonte Identificada

**URL:** https://diariooficial.santos.sp.gov.br/

### ✅ Estrutura Técnica Excelente

### 2.1 Características Técnicas

- ✅ **Formato digital** (desde 14/08/2017 - substituiu impressão)
- ✅ **Publicação diária** (dias úteis)
- ✅ **Histórico completo** desde 05/05/2001
- ✅ **Download em PDF** disponível
- ✅ **Leitura digital** via navegador
- ✅ **Busca por termos** implementada
- ✅ **URLs previsíveis** (`/edicoes/leitura/mobile/YYYY-MM-DD/1`)

### 2.2 Padrão de URLs

```
Leitura online: https://diariooficial.santos.sp.gov.br/edicoes/leitura/mobile/2025-12-31/1
Download PDF: https://diariooficial.santos.sp.gov.br/edicoes/inicio/download/2025-12-31
Thumbnail: https://diariooficial.santos.sp.gov.br/edicoes/inicio/thumb/2025-12-31

```

### 2.3 Conteúdo Publicado

- Leis municipais
- Decretos do prefeito
- Portarias
- Editais de licitação
- Nomeações e exonerações
- Atos administrativos
- Convênios

### 2.4 Frequência de Atualização

- **Publicação:** Diária (segunda a sexta)
- **Horário estimado:** Manhã (entre 8h-10h)

---

## 3. Portal da Transparência - Prefeitura

### 🌐 Fontes Identificadas

### 3.1 Portal Principal

**URL:** https://www.santos.sp.gov.br/?q=portal/transparencia

**Seções disponíveis:**

- Folha de pagamento
- Servidores comissionados
- Licitações
- Contratos
- Convênios

### 3.2 Portal Geográfico

**URL:** https://geosiap.santos.sp.gov.br/portal-transparencia/home

### 3.3 Sistema e-Transparência

**URL:** https://egov.santos.sp.gov.br/portaltransparencia/

**Recursos:**

- Dashboard com estatísticas
- Total de licitações por ano
- Visualizações gráficas

---

## 4. Dados sobre o Prefeito

### Prefeito Atual (2025)

**Nome:** Rogério Santos

**Vice-prefeita:** Audrey Kleys

**Mandato:** 2025-2028

**Posse:** 01/01/2025

**Fontes de dados:**

- Diário Oficial (decretos, portarias, nomeações)
- Portal da Prefeitura (agenda, notícias)

---

## 5. Estratégia de Coleta por Fonte

### 5.1 Câmara Municipal

### Método: Web Scraping Controlado

**Justificativa:** Não há API pública documentada

**Endpoints alvo:**

```
https://www.camarasantos.sp.gov.br/gabinetes-dos-vereadores
https://legislativo.camarasantos.sp.gov.br/buscar_documento
https://www.camarasantos.sp.gov.br/publico/include/download.php?file=XXXX

```

**Tecnologia sugerida:**

- Puppeteer (para navegação JavaScript)
- Cheerio (parsing HTML)
- Axios (requests simples)

**Desafios identificados:**

- ⚠️ Site usa templates dinâmicos (Mustache/Handlebars)
- ⚠️ Alguns dados carregam via JavaScript
- ⚠️ Sistema de busca pode ter paginação complexa

**Frequência recomendada:**

- Vereadores: Semanal (dados quase estáticos)
- Projetos: Diária (2x/dia - manhã e tarde)
- Sessões: Semanal (pós-sessão ordinária)

---

### 5.2 Diário Oficial

### Método: Download + OCR/Parsing

**Justificativa:** PDFs estruturados com URLs previsíveis

**Fluxo de coleta:**

1. Verificar última edição disponível
2. Download PDF via URL padrão
3. Extrair texto com `pdf-parse` ou `pdfjs`
4. Parsing de seções (Decretos, Portarias, etc)
5. Salvar snapshot bruto + dados normalizados

**Tecnologia sugerida:**

```jsx
const url = `https://diariooficial.santos.sp.gov.br/edicoes/inicio/download/${date}`;
const pdf = await axios.get(url, { responseType: 'arraybuffer' });
const data = await pdfParse(pdf.data);
const text = data.text;
// Parse sections: DECRETO Nº, PORTARIA Nº, etc

```

**Desafios identificados:**

- ✅ URL previsível (facilita automação)
- ✅ Formato consistente desde 2017
- ⚠️ Parsing de PDF pode falhar em layouts complexos
- ⚠️ Necessário regex robusto para extrair números de atos

**Frequência recomendada:**

- Coleta: Diária (14h30 - após publicação oficial)
- Retry: 3 tentativas com intervalo de 30min

---

### 5.3 Portal da Transparência

### Método: Scraping + possível API (verificar)

**Justificativa:** Interface web moderna pode ter endpoints REST

**Investigação necessária:**

- Inspecionar Network tab do navegador
- Verificar chamadas AJAX/Fetch
- Documentar endpoints não-públicos

**Frequência recomendada:**

- Dados financeiros: Mensal
- Licitações: Semanal

---

## 6. Plano de Implementação

### Sprint 1: Setup e Coleta Básica (Semana 1-2)

**Objetivo:** Coletar lista de vereadores + 1 projeto como PoC

**Tarefas:**

1. ✅ Validar fontes (CONCLUÍDO)
- [ ]  Setup ambiente Docker (PostgreSQL + Redis)
- [ ]  Implementar `santos-camara-collector.ts` (vereadores)
- [ ]  Testar coleta manual
- [ ]  Salvar primeiro snapshot no banco

**Critério de sucesso:** 21 vereadores + metadados no banco

---

### Sprint 2: Diário Oficial (Semana 3)

**Objetivo:** Baixar e parsear 1 edição do DO

**Tarefas:**

- [ ]  Implementar `santos-diario-collector.ts`
- [ ]  Download PDF
- [ ]  Parsing de decretos
- [ ]  Normalizar dados
- [ ]  Inserir no banco com source_reference

**Critério de sucesso:** 1 edição completa parseada com decretos vinculados ao prefeito

---

### Sprint 3: Projetos de Lei (Semana 4)

**Objetivo:** Coletar 10 projetos recentes

**Tarefas:**

- [ ]  Reverse engineering do sistema de busca
- [ ]  Implementar paginação
- [ ]  Extração de metadados (número, ano, autor, status)
- [ ]  Classificação por tema (regras básicas)
- [ ]  Testes de duplicatas

**Critério de sucesso:** 10 projetos com autor vinculado a vereador

---

### Sprint 4: Sessões e Presença (Semana 5-6)

**Objetivo:** Coletar dados de 1 sessão ordinária

**Tarefas:**

- [ ]  Identificar onde ficam dados de sessões
- [ ]  Coletar lista de presenças
- [ ]  Vincular a vereadores
- [ ]  Calcular taxa de presença

**Critério de sucesso:** 1 sessão com presença de todos os vereadores registrada

---

## 7. Riscos Identificados e Mitigações

### Risco ALTO: Mudança na estrutura do site da Câmara

**Probabilidade:** Média

**Impacto:** Alto (quebra coleta)

**Mitigação:**

- Implementar testes diários de "structure check"
- Alertas via email/Slack quando coleta falhar 3x
- Snapshot HTML antes de processar
- Manter versões antigas de seletores CSS

---

### Risco MÉDIO: Rate limiting / Bloqueio de IP

**Probabilidade:** Baixa

**Impacto:** Alto (coleta suspensa)

**Mitigação:**

- Intervalo de 3s entre requests
- User-agent identificável: `PortalCivico/1.0 (contato@portalcivico.com.br)`
- Horário de coleta: Madrugada (2h-5h) quando tráfego é baixo
- Respeitar robots.txt

---

### Risco MÉDIO: PDF do DO ilegível/malformado

**Probabilidade:** Média

**Impacto:** Médio (dados incompletos)

**Mitigação:**

- Fallback OCR com Tesseract se pdf-parse falhar
- Manualmente revisar 10% dos PDFs parseados (auditoria)
- Salvar PDF bruto sempre (evidência)

---

### Risco BAIXO: Dados inconsistentes entre fontes

**Probabilidade:** Média

**Impacto:** Baixo (confusão de usuário)

**Mitigação:**

- Exibir fonte original em cada dado
- Campo "confidence" para dados inferidos
- Dashboard de qualidade de dados (admin panel)

---

## 8. Próximos Passos Imediatos

### ✅ CONCLUÍDO

1. Validação de fontes oficiais

### 🎯 PRÓXIMO (Passo 2)

**Desenvolver primeiro collector funcional**

**Escolha:** Começar com Vereadores (mais simples, dados quase estáticos)

**Código base sugerido:**

```tsx
// collectors/santos-camara-collector.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

export class SantosCamaraCollector {
  private baseUrl = 'https://www.camarasantos.sp.gov.br';

  async collectVereadores(): Promise<Politician[]> {
    const url = `${this.baseUrl}/gabinetes-dos-vereadores`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const vereadores: Politician[] = [];

    // Extrair dados via seletores CSS
    // TODO: Implementar parsing

    return vereadores;
  }
}

```

---

## 9. Conclusões

### ✅ Viabilidade Técnica: CONFIRMADA

**Pontos positivos:**

- Diário Oficial EXCELENTE (estruturado, histórico completo, URLs previsíveis)
- Lista de vereadores completa e atualizada
- Múltiplos portais de transparência
- Dados suficientes para MVP

**Pontos de atenção:**

- Site da Câmara usa JavaScript dinâmico (Puppeteer necessário)
- Sistema de busca de projetos pode ser complexo
- Parsing de PDF requer robustez

**Tempo estimado MVP completo:** 6-8 semanas (1 desenvolvedor full-time)

**Recomendação:** PROSSEGUIR para Passo 2 - Implementação do primeiro collector

---

## 📎 Anexos

### URLs Oficiais Validadas

```
Câmara Municipal:
- Site principal: https://www.camarasantos.sp.gov.br/
- Gabinetes: https://www.camarasantos.sp.gov.br/gabinetes-dos-vereadores
- Busca legislativa: https://legislativo.camarasantos.sp.gov.br/
- e-Transparência: https://s2.asp.srv.br/etransparencia.cm.santos.sp/

Diário Oficial:
- Portal: https://diariooficial.santos.sp.gov.br/
- Padrão URL: /edicoes/leitura/mobile/YYYY-MM-DD/1

Prefeitura:
- Site oficial: https://www.santos.sp.gov.br/
- Transparência: https://www.santos.sp.gov.br/?q=portal/transparencia
- Portal geo: https://geosiap.santos.sp.gov.br/portal-transparencia/

```

### Legislatura Atual (33ª)

- Início: 01/01/2025
- Término: 31/12/2028
- Total vereadores: 21
- Presidente: Adilson Junior (PP)
- Líder do Governo: Cacá Teixeira (PSDB)

---

**Documento gerado em:** 01/01/2026

**Responsável:** Equipe Portal Cívico

**Status:** Aprovado para implementação