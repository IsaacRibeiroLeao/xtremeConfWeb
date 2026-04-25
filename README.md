# 🔥 Conexão Xtreme - Sistema de Vendas

Sistema de vendas para eventos da igreja, com gerenciamento de cardápio, pedidos, bingo e relatórios.

## Funcionalidades

- **📋 Cardápio**: Cadastro de categorias e pratos com preços
- **🛒 Pedidos**: Sistema de carrinho com múltiplos itens
- **🎯 Bingo**: Integração automática com pratos que dão direito a participar
- **📊 Relatórios**: Visualização de vendas e exportação para Excel
- **⚙️ Configurações**: Gerenciamento de dados e limpeza

## Tecnologias

- React 18 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- Vite
- XLSX (exportação Excel)

## Cores do Tema

- **Vermelho**: #E63928
- **Amarelo**: #F9D648
- **Laranja**: #F28C28
- **Azul**: #2E3A8C
- **Preto**: #1A0A0A
- **Creme**: #F1E4C1

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o Supabase:
   - Crie um projeto no [Supabase](https://supabase.com)
   - Execute o SQL do arquivo `supabase-schema.sql` no SQL Editor
   - Copie a URL e a Anon Key do projeto
   - Crie um arquivo `.env`:
   ```bash
   cp .env.example .env
   ```
   - Preencha com suas credenciais do Supabase

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Estrutura do Banco de Dados

O sistema usa as seguintes tabelas no Supabase:

- **categories**: Categorias do cardápio
- **dishes**: Pratos disponíveis
- **orders**: Pedidos realizados
- **bingo**: Participantes do bingo

> Execute o arquivo `supabase-schema.sql` no SQL Editor do Supabase para criar todas as tabelas.

## Uso

### Cardápio
1. Acesse "Cardápio" no menu
2. Crie categorias (ex: Lanches, Bebidas, Sobremesas)
3. Adicione pratos às categorias
4. Marque quais pratos dão direito ao bingo

### Pedidos
1. Na tela principal, selecione os pratos
2. Ajuste quantidades no carrinho
3. Se houver itens com bingo, informe o nome do cliente
4. Finalize o pedido

### Bingo
1. Participantes são adicionados automaticamente via pedidos
2. Também é possível adicionar manualmente
3. Use o botão "Sortear" para fazer o sorteio

### Relatórios
1. Visualize resumo de vendas
2. Veja vendas por prato e categoria
3. Exporte para Excel quando necessário

## Deploy na Vercel

### Opção 1: Via GitHub (Recomendado)

1. Faça push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) e faça login
3. Clique em "Add New Project"
4. Importe o repositório do GitHub
5. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
6. Clique em "Deploy"

### Opção 2: Via CLI

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

> **Importante**: Configure as variáveis de ambiente no dashboard da Vercel em Settings > Environment Variables.

## Licença

Desenvolvido para uso interno da igreja.
