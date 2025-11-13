# Base de Conhecimento - Configuração

Sistema de gestão de conhecimento com Next.js, TypeScript e PostgreSQL.

## Pré-requisitos

- Node.js 20.9.0 ou superior
- PostgreSQL (local ou remoto)
- Windows (WSL2 opcional)

## Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar PostgreSQL

#### Opção A: PostgreSQL Local (Recomendado)
1. Baixar e instalar PostgreSQL para Windows: https://www.postgresql.org/download/windows/
2. Durante a instalação, definir senha para usuário `postgres`
3. Criar banco de dados:

```sql
CREATE DATABASE base_conhecimento;
```

#### Opção B: PostgreSQL via Docker
```bash
docker run --name postgres-base -e POSTGRES_PASSWORD=password -e POSTGRES_DB=base_conhecimento -p 5432:5432 -d postgres:15
```

### 3. Configurar Variáveis de Ambiente

Editar o arquivo `.env.local` com suas credenciais do PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/base_conhecimento?schema=public"
```

### 4. Configurar Banco de Dados

```bash
# Gerar o cliente Prisma
npm run db:generate

# Aplicar o schema ao banco
npm run db:push
```

### 5. Executar a Aplicação

```bash
npm run dev
```

A aplicação estará disponível em: http://localhost:3000

## Estrutura do Projeto

```
base-conhecimento/
├── src/
│   ├── app/
│   │   ├── api/          # API Routes
│   │   ├── scripts/      # Página de Scripts PostgreSQL
│   │   ├── informacoes/  # Página de Informações Gerais
│   │   ├── erros/        # Página de Erros
│   │   └── admin/        # Página de Administração
│   └── components/       # Componentes React
├── prisma/
│   └── schema.prisma     # Schema do banco de dados
└── lib/
    └── prisma.ts         # Configuração do Prisma Client
```

## Funcionalidades

### ✅ Seções Implementadas
- **Scripts PostgreSQL**: Queries com busca e botão de cópia
- **Informações Gerais**: Documentação do sistema
- **Erros**: Base de conhecimento para troubleshooting
- **Administração**: CRUD completo para gerenciar conteúdo

### 🔍 Busca
- Pesquisa por título
- Pesquisa por conteúdo
- Pesquisa por tags

### 📋 Funcionalidades de Cópia
- Botão para copiar query/conteúdo completo
- Feedback visual de sucesso

### 🎨 Interface
- Design responsivo com Tailwind CSS
- Sidebar com navegação
- Tema escuro para código PostgreSQL

## Scripts Disponíveis

```bash
npm run dev         # Executar em modo desenvolvimento
npm run build       # Build para produção
npm run start       # Executar build de produção
npm run db:generate # Gerar cliente Prisma
npm run db:push     # Aplicar schema ao banco
npm run db:studio   # Abrir Prisma Studio
```

## Troubleshooting

### Erro de Conexão com PostgreSQL
1. Verificar se PostgreSQL está rodando
2. Confirmar credenciais no `.env.local`
3. Testar conexão: `psql -U postgres -h localhost`

### Erro de Dependências
1. Verificar versão do Node.js (>=20.9.0)
2. Limpar cache: `npm cache clean --force`
3. Reinstalar: `rm -rf node_modules && npm install`

### Problemas no Windows
- Usar PowerShell como Administrador
- Considerar usar WSL2 para melhor compatibilidade

## Dados de Exemplo

Após configurar o banco, você pode adicionar dados através da página `/admin`.

### Exemplo de Script PostgreSQL:
- **Título**: "Consultar usuários ativos"
- **Conteúdo**: `SELECT * FROM users WHERE active = true ORDER BY created_at DESC;`
- **Tags**: `select, users, active`

### Exemplo de Erro:
- **Título**: "Connection timeout PostgreSQL"
- **Conteúdo**:
```
**Problema:**
Timeout ao conectar com PostgreSQL

**Solução:**
1. Verificar se o serviço PostgreSQL está rodando
2. Ajustar timeout na connection string
3. Verificar firewall
```
- **Tags**: `postgresql, timeout, connection`

## Contribuição

Para adicionar novas funcionalidades:
1. Criar nova API route em `src/app/api/`
2. Implementar componente em `src/components/`
3. Adicionar página em `src/app/`
4. Atualizar Sidebar se necessário