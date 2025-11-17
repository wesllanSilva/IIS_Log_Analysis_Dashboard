# WSTACK - IIS Log Analytics Guide

## Visão Geral

O sistema foi evoluído para uma plataforma completa de análise de performance de aplicações .NET. Agora você pode:

1. **Fazer upload de logs IIS** de até 500MB
2. **Analisar endpoints** identificando gargalos de performance
3. **Visualizar gráficos** de tempo médio e máximo
4. **Salvar análises** no banco de dados para comparações futuras
5. **Acessar histórico** de todas as análises anteriores

## Funcionalidades Principais

### 1. Upload e Processamento de Logs

- Suporta arquivos IIS até 500MB
- Processamento otimizado em chunks para não travar o navegador
- Progresso em tempo real durante o processamento
- Armazena apenas 50.000 registros representativos na memória
- Processa até 1.2 milhões de linhas sem problemas

### 2. Dashboard de Análise

Após carregar um arquivo, você verá:

#### Cards de Resumo
- **Total de Endpoints**: Quantidade única de endpoints
- **Tempo Médio**: Resposta média em toda a aplicação
- **Taxa de Erro**: Percentual de requisições que falharam

#### Gráfico de Tempo Médio
- Top 6 endpoints mais requisitados
- Comparação visual do tempo médio de resposta

#### Gráfico de Tempo Máximo
- Identifica picos de latência
- Mostra anomalias de performance

#### Tabelas Detalhadas

**Endpoints Mais Lentos**
- Ordenados por tempo médio de resposta
- Mostra: Endpoint, Tempo Médio, Tempo Máximo, Chamadas

**Endpoints Mais Requisitados**
- Ordenados por volume de requisições
- Identifica endpoints sobrecarregados

### 3. Autenticação Segura

- Conta pessoal com email e senha
- Dados isolados por usuário
- Session management automático

### 4. Histórico de Análises

- Acesse análises anteriores
- Comparar performance entre períodos
- Salve análises para auditoria

## Como Usar

### Primeira Vez

1. **Sign Up**: Crie uma conta com seu email
2. **Login**: Entre com suas credenciais
3. **Upload**: Carregue um arquivo IIS de log

### Analisando Logs

1. Vá para **Upload & Analyze**
2. Clique em "Selecionar arquivo"
3. Escolha seu arquivo IIS (.log)
4. Aguarde o processamento
5. Explore os dados nos gráficos e tabelas
6. Clique em **Save Analysis** para salvar

### Visualizando Histórico

1. Clique em **History**
2. Selecione uma análise anterior
3. Veja os mesmos gráficos e dados salvos

## Interpretando os Dados

### Métricas Importantes

**Tempo Médio vs Máximo**
- Se forem muito diferentes, indica inconsistência
- Exemplo: 500ms médio + 50s máximo = problema intermitente

**Taxa de Erro**
- Acima de 2% merece investigação
- HTTP 500: erro de servidor
- HTTP 429: throttling/rate limit
- HTTP 504: timeout de backend

**Volume de Requisições**
- Endpoints muito requisitados podem ser gargalos
- Considere cache ou otimização de queries

### Exemplo de Interpretação

```
Endpoint: /Login/Index
Média: 2059ms
Máximo: 217736ms (217s!)
Chamadas: 3414

ANÁLISE:
- Login é crítico e muito requisitado
- Tempo máximo absurdamente alto
- Possível: Query de banco lenta, deadlock, ou timeout de rede
- AÇÃO: Revisar query SQL, índices do banco, ou integração com auth provider
```

## Estrutura do Banco de Dados

### Tabelas

**log_uploads**
- Registro de cada upload
- Metadados: arquivo, total de linhas, data

**endpoint_stats**
- Estatísticas agregadas por endpoint
- Contém: tempo médio, máximo, mínimo, erros

**endpoint_requests**
- Sample de 1000 primeiras requisições
- Detalhes: endpoint, status, tempo, user agent

## Dicas de Performance

### Para Reduzir Tempo Médio

1. **Adicionar Cache**
   - Redis para sessions
   - Cache HTTP para endpoints estáticos

2. **Otimizar Queries**
   - Adicionar índices no banco
   - Usar Entity Framework include() inteligentemente
   - Considerar stored procedures complexas

3. **Connection Pooling**
   - Reusar conexões de banco
   - Evitar abrir/fechar constantemente

### Para Reduzir Taxa de Erro

1. **Implementar Retry Logic**
   - Transient errors: retry automático
   - Permanent errors: feedback ao usuário

2. **Circuit Breaker**
   - Evitar cascata de falhas
   - Fallback para modo degradado

3. **Monitoring**
   - Log de exceções detalhadas
   - Alertas de taxa de erro

## Suporte

Para problemas:
1. Verifique se o arquivo IIS está formatado corretamente
2. Tente com um arquivo menor primeiro
3. Limpe o cache do navegador
4. Entre em contato com suporte
