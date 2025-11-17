# WSTACK - Arquitetura da Solução

## Resumo Executivo

Evoluímos o sistema de um simples analisador de logs para uma **plataforma enterprise de análise de performance**. A solução identifica endpoints lentos, requisições excessivas e problemas de performance em aplicações .NET.

## Componentes Principais

### 1. Frontend (React + TypeScript)

**Páginas**
- `Auth.tsx` - Autenticação (sign up/sign in)
- `Dashboard.tsx` - Upload e análise de logs
- `AnalyticsReport.tsx` - Dashboard visual com gráficos
- `AnalysisHistory.tsx` - Histórico de análises salvas

**Serviços**
- `supabaseClient.ts` - Cliente Supabase singleton
- `analyticsService.ts` - API de analytics (CRUD)

**Utilitários**
- `logHelpers.ts` - Parse otimizado de arquivos IIS
  - Processamento em chunks
  - Baixo uso de memória
  - Suporta até 500MB

### 2. Backend (Supabase)

**Autenticação**
- Email/Password padrão Supabase
- JWT tokens automáticos
- Session management

**Banco de Dados**

```sql
log_uploads
├── id (uuid, PK)
├── user_id (uuid, FK)
├── filename (text)
├── total_lines (bigint)
├── processed_entries (bigint)
└── upload_date (timestamptz)

endpoint_stats
├── id (uuid, PK)
├── upload_id (uuid, FK)
├── endpoint (text)
├── request_count (bigint)
├── avg_time_ms (numeric)
├── min_time_ms (bigint)
├── max_time_ms (bigint)
├── error_count (bigint)
└── success_rate (numeric)

endpoint_requests
├── id (uuid, PK)
├── upload_id (uuid, FK)
├── endpoint (text)
├── date (text)
├── time (text)
├── time_taken (bigint)
├── sc_status (integer)
├── cs_user_agent (text)
└── cs_host (text)
```

**RLS (Row Level Security)**
- Cada usuário vê apenas seus dados
- Policies para read/write/delete

**Índices**
- Upload por usuário
- Endpoint por upload
- Request por endpoint

### 3. Visualizações

**Cards Resumo**
- Total de endpoints
- Tempo médio global
- Taxa de erro

**Gráficos**
- Bar chart: Tempo médio por endpoint (top 6)
- Bar chart: Tempo máximo por endpoint (top 6)

**Tabelas**
- Endpoints mais lentos (ordenado por tempo médio)
- Endpoints mais requisitados (ordenado por volume)

## Fluxo de Dados

```
Usuário faz upload IIS
    ↓
FileReader (navegador)
    ↓
parseIISLog() - processamento em chunks
    ↓ (50.000 registros max)
calculateRouteStats() - agregação por endpoint
    ↓
Exibe Dashboard (gráficos + tabelas)
    ↓
handleSaveAnalysis() - salva em DB
    ↓
Supabase API
    ↓
log_uploads + endpoint_stats + endpoint_requests
```

## Otimizações Implementadas

### Performance de Upload

**Problema**: 310MB com 1.2M linhas travava o navegador

**Solução**:
1. Processamento assíncrono em chunks de 2MB
2. `setTimeout(..., 0)` para yield ao navegador
3. Buffer reutilizável entre chunks
4. Limpeza agressiva de memória (`lines.length = 0`)
5. Limite de 50.000 registros em memória

**Resultado**: Carrega completamente até 100% sem travamentos

### Performance de Visualização

**Problema**: Armazenar 50k objetos + gráficos Recharts é pesado

**Solução**:
1. Lazy load de componentes
2. Limite de 6 endpoints no gráfico
3. Memoização de dados do gráfico
4. CSS module para estilos dinâmicos

### Segurança de Dados

**RLS Policies**:
```sql
-- Usuário só vê suas análises
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id

-- Supabase pode escrever dados processados
Service role pode fazer qualquer coisa

-- Isolamento total entre usuários
```

## Casos de Uso

### 1. Identificar Gargalos Pós-Deploy

```
Upload log após atualização de sistema
Vê: /Login/Index com 217s máximo
Raiz: DEV adicionou JOIN desnecessário
Solução: Remover JOIN, adicionar índice
Validação: Re-upload log após fix
```

### 2. Monitorar Picos de Latência

```
Identifica endpoints com variação alta (max >> avg)
Exemplo: 100ms médio + 50s máximo = problema intermitente
Investigação: Rate limiting? Timeout de BD? Dead lock?
```

### 3. Detectar Requisições Excessivas

```
Vê endpoint com 100k requisições em 1 hora
Análise: Loop infinito? N+1 queries?
Solução: Implementar cache ou otimizar loop
```

### 4. Auditoria de Performance

```
Salva análise após cada deploy
Compara histórico de performance
Identifica regressões
Valida melhorias implementadas
```

## Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + TypeScript | 18.3 / 5.5 |
| Styling | Tailwind CSS | 3.4 |
| Gráficos | Recharts | Latest |
| Ícones | Lucide React | 0.344 |
| Backend | Supabase | 2.57 |
| Build | Vite | 7.2 |
| Auth | Supabase Auth | JWT |
| DB | PostgreSQL | 15+ |

## Escalabilidade

### Limitações Atuais

- 50k registros em memória (por design)
- 1000 request samples salvos (controlado)
- Até 500MB por arquivo

### Como Escalar

1. **Múltiplos uploads**: Implementar fila de processamento
2. **Análises em background**: Edge Functions do Supabase
3. **Mais dados**: Aumentar processed_entries + adicionar paginação
4. **Tempo real**: WebSockets para updates ao vivo

## Melhorias Futuras

### V2.0

- [ ] Comparação entre análises (antes/depois)
- [ ] Alertas automáticos de anomalias
- [ ] Export para PDF/Excel
- [ ] Integração com New Relic/DataDog
- [ ] API REST para automation

### V3.0

- [ ] Real-time log streaming
- [ ] ML para detecção de padrões
- [ ] Recomendações automáticas
- [ ] Integração com GitHub Actions
- [ ] Métricas por hora/dia/semana

## Troubleshooting

### Upload fica em 94%

**Causa**: Memória insuficiente ao salvar
**Solução**: Aumentar limite de processamento ou dividir arquivo

### Gráficos não aparecem

**Causa**: Stats vazias ou dados inválidos
**Solução**: Verificar formato do arquivo IIS

### Dados não salvam

**Causa**: Usuário não autenticado
**Solução**: Fazer login novamente

## Documentação

- `ANALYTICS_GUIDE.md` - Guia de uso
- `ARCHITECTURE.md` - Este documento
- Comentários inline no código
