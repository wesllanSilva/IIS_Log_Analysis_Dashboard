# IIS Log Analyzer

Um aplicativo moderno para análise e visualização de arquivos de log IIS (Internet Information Services). Construído com React, TypeScript e Tailwind CSS.

## Visão Geral

O IIS Log Analyzer permite que você carregue arquivos de log do IIS diretamente no navegador, processe as entradas e visualize métricas detalhadas sobre o desempenho do servidor. Não requer backend - tudo funciona localmente no seu navegador.

## Características Principais

- **Upload de Arquivo**: Interface drag-and-drop para selecionar arquivos .log do IIS
- **Parser Automático**: Leitura e análise automática do formato de log do IIS
- **Análise por Rota**: Agrupamento e estatísticas de cada rota de servidor
- **Métricas Detalhadas**:
  - Tempo médio, mínimo e máximo de resposta
  - Número total de requisições
  - Contagem de erros (status != 200)
  - Taxa de sucesso em percentual

- **Dashboard Interativo**:
  - Cartões de resumo com métricas gerais
  - Gráfico de barras com tempo médio de resposta por rota
  - Tabela detalhada com todas as estatísticas
  - Sistema de filtros por rota e status

- **Filtros Avançados**:
  - Pesquisar por rota/URI
  - Filtrar por status HTTP (Sucesso/Erro)
  - Visualizar dados em tempo real

## Estrutura do Projeto

```
src/
├── components/
│   ├── Dashboard.tsx          # Componente principal
│   ├── FileUploader.tsx       # Upload de arquivo
│   ├── SummaryCards.tsx       # Cartões de resumo
│   ├── ChartView.tsx          # Gráfico de barras
│   ├── StatsTable.tsx         # Tabela de estatísticas
│   └── FilterPanel.tsx        # Painel de filtros
├── types/
│   └── index.ts               # Definições TypeScript
├── utils/
│   └── logHelpers.ts          # Funções de parsing e análise
├── App.tsx                    # App raiz
└── main.tsx                   # Entry point
```

## Como Rodar Localmente

### Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn

### Instalação

1. **Clone ou acesse o diretório do projeto:**
   ```bash
   cd seu-projeto
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Abra no navegador:**
   ```
   http://localhost:5173
   ```

### Comandos Disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Verificar tipos TypeScript
npm run typecheck

# Lint do código
npm run lint
```

## Como Usar

1. **Carregue um arquivo de log:**
   - Clique na área de upload ou arraste um arquivo `.log` do IIS
   - O arquivo será processado automaticamente

2. **Visualize as métricas:**
   - Cartões de resumo mostram estatísticas gerais
   - Gráfico exibe tempo médio por rota
   - Tabela contém todos os detalhes

3. **Aplique filtros:**
   - Use o campo de pesquisa para encontrar rotas específicas
   - Selecione o status (Todos, Sucesso, Erros)

4. **Carregue outro arquivo:**
   - Clique em "Upload New File" para analisar outro log

## Formato de Log IIS Suportado

O analisador suporta logs do IIS com os seguintes campos (conforme declarado em `#Fields:`):

```
date time s-ip cs-method cs-uri-stem cs-uri-query s-port cs-username c-ip cs-user-agent cs-referer sc-status sc-substatus sc-win32-status time-taken
```

Exemplo de linha de log:
```
2025-10-31 00:00:00 192.168.1.1 GET /Home/ping - 80 - 192.168.1.2 Mozilla/5.0 - 200 0 0 2
```

## Tecnologias Utilizadas

- **React 18**: Framework UI
- **TypeScript**: Linguagem tipada
- **Tailwind CSS**: Styling
- **Vite**: Build tool
- **Lucide React**: Ícones

## Funcionalidades das Métricas

### Cartões de Resumo
- **Total de Requisições**: Número total de logs processados
- **Sucessos**: Requisições com status 200
- **Erros**: Requisições com status diferente de 200
- **Tempo Médio**: Tempo médio de resposta em ms ou segundos

### Gráfico de Barras
- Top 10 rotas mais acionadas
- Código de cores: Verde (rápido), Amarelo (médio), Laranja (lento), Vermelho (com erros)
- Mostra taxa de sucesso dentro da barra

### Tabela de Estatísticas
- **Rota**: URI do endpoint
- **Requisições**: Contagem total
- **Tempo Médio**: Média de resposta
- **Min/Max**: Tempos mínimo e máximo
- **Erros**: Contagem de status != 200
- **Taxa de Sucesso**: Percentual com barra visual

## Processamento de Dados

O analisador:
1. Lê o arquivo completo no navegador
2. Identifica a linha `#Fields:` para mapear colunas
3. Processa cada linha dividindo por espaços em branco
4. Converte tipos numéricos (status, time-taken)
5. Agrupa por rota e calcula estatísticas
6. Aplica filtros em tempo real

## Performance

- Processa logs com milhares de entradas instantaneamente
- Sem necessidade de upload para servidor
- Análise 100% no navegador do cliente
- Consome pouca memória

## Limitações

- Máximo de arquivo limitado pela memória do navegador (geralmente 500MB+)
- Requer JavaScript habilitado
- Dados não são persistidos ao recarregar a página

## Próximas Melhorias Possíveis

- Exportar dados para CSV/JSON
- Gráficos adicionais (pizza, linha temporal)
- Suporte para múltiplos formatos de log
- Persistência de dados no IndexedDB
- Comparação entre múltiplos logs

## Contribuindo

Sinta-se à vontade para melhorar o projeto! Sugestões e correções são bem-vindas.

## Licença

MIT

## Suporte

Para problemas ou dúvidas, verifique:
- Se o arquivo está no formato correto do IIS
- Se todos os campos esperados estão presentes
- Se o navegador suporta ES6 e Fetch API
