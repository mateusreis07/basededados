// Dados mockados para funcionamento sem banco de dados

export const mockSections = [
  {
    id: 'scripts',
    name: 'Scripts PostgreSQL',
    description: 'Queries e scripts PostgreSQL',
    _count: { items: 3 }
  },
  {
    id: 'informacoes',
    name: 'Informações Gerais',
    description: 'Documentação do sistema',
    _count: { items: 2 }
  },
  {
    id: 'erros',
    name: 'Erros',
    description: 'Troubleshooting e soluções',
    _count: { items: 2 }
  }
]

export const mockItems = [
  // Scripts PostgreSQL
  {
    id: '1',
    title: 'Consultar usuários ativos',
    content: `SELECT
    u.id,
    u.name,
    u.email,
    u.created_at,
    u.last_login
FROM users u
WHERE u.active = true
    AND u.last_login >= NOW() - INTERVAL '30 days'
ORDER BY u.last_login DESC;`,
    tags: ['select', 'users', 'active', 'postgresql'],
    sectionId: 'scripts',
    section: { id: 'scripts', name: 'Scripts PostgreSQL' },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Backup de tabela específica',
    content: `-- Fazer backup de uma tabela específica
pg_dump -h localhost -U postgres -t usuarios base_conhecimento > backup_usuarios.sql

-- Restaurar backup
psql -h localhost -U postgres -d base_conhecimento < backup_usuarios.sql`,
    tags: ['backup', 'pg_dump', 'restore', 'postgresql'],
    sectionId: 'scripts',
    section: { id: 'scripts', name: 'Scripts PostgreSQL' },
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z'
  },
  {
    id: '3',
    title: 'Performance - Índices mais usados',
    content: `SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as "Uso do Índice",
    idx_tup_read as "Tuplas Lidas",
    idx_tup_fetch as "Tuplas Buscadas"
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC
LIMIT 10;`,
    tags: ['performance', 'index', 'monitoring', 'postgresql'],
    sectionId: 'scripts',
    section: { id: 'scripts', name: 'Scripts PostgreSQL' },
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z'
  },

  // Informações Gerais
  {
    id: '4',
    title: 'Configuração do Ambiente de Desenvolvimento',
    content: `**Requisitos do Sistema:**

- Node.js 20.9.0 ou superior
- PostgreSQL 12+
- Git
- Editor de código (VS Code recomendado)

**Variáveis de Ambiente:**
Criar arquivo .env.local com:

DATABASE_URL="postgresql://user:password@localhost:5432/base_conhecimento"
NODE_ENV="development"

**Extensões VS Code Recomendadas:**
- PostgreSQL (ms-ossdata.vscode-postgresql)
- Prisma (Prisma.prisma)
- Tailwind CSS IntelliSense
- TypeScript Importer`,
    tags: ['configuracao', 'ambiente', 'setup'],
    sectionId: 'informacoes',
    section: { id: 'informacoes', name: 'Informações Gerais' },
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-20T16:30:00Z'
  },
  {
    id: '5',
    title: 'Padrões de Código e Nomenclatura',
    content: `**Convenções de Naming:**

- Arquivos: kebab-case (user-profile.tsx)
- Componentes: PascalCase (UserProfile)
- Variáveis: camelCase (userName)
- Constantes: UPPER_SNAKE_CASE (API_BASE_URL)
- Tabelas DB: snake_case (user_profiles)

**Estrutura de Componentes:**
1. Imports
2. Interfaces/Types
3. Component function
4. Hooks e estado
5. Event handlers
6. Render
7. Export default

**Git Commit Pattern:**
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes`,
    tags: ['codigo', 'padrao', 'nomenclatura', 'git'],
    sectionId: 'informacoes',
    section: { id: 'informacoes', name: 'Informações Gerais' },
    createdAt: '2024-01-12T13:45:00Z',
    updatedAt: '2024-01-12T13:45:00Z'
  },

  // Erros
  {
    id: '6',
    title: 'Erro: Connection timeout PostgreSQL',
    content: `**Problema:**
Timeout ao conectar com PostgreSQL - "connection timeout"

**Possíveis Causas:**
1. Serviço PostgreSQL não está rodando
2. Configuração incorreta de rede/firewall
3. Pool de conexões esgotado
4. Configurações de timeout muito baixas

**Soluções:**

**1. Verificar se PostgreSQL está rodando:**
Windows: services.msc → PostgreSQL
Linux: sudo systemctl status postgresql

**2. Testar conexão manual:**
psql -h localhost -U postgres -d base_conhecimento

**3. Ajustar timeout no .env.local:**
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connect_timeout=60"

**4. Verificar firewall Windows:**
- Permitir PostgreSQL na porta 5432
- Desabilitar temporariamente para teste

**5. Restart do serviço:**
Windows: services.msc → PostgreSQL → Restart
Docker: docker restart postgres-container`,
    tags: ['postgresql', 'timeout', 'connection', 'troubleshooting'],
    sectionId: 'erros',
    section: { id: 'erros', name: 'Erros' },
    createdAt: '2024-01-18T08:20:00Z',
    updatedAt: '2024-01-18T08:20:00Z'
  },
  {
    id: '7',
    title: 'Erro: npm install falha no Windows',
    content: `**Problema:**
npm install falha com erros de permissão ou timeout no Windows

**Soluções:**

**1. Executar como Administrador:**
- Abrir PowerShell/CMD como Administrador
- Navegar para pasta do projeto
- Executar npm install

**2. Limpar cache npm:**
npm cache clean --force
npm cache verify

**3. Configurar proxy (se aplicável):**
npm config set proxy http://proxy:porta
npm config set https-proxy http://proxy:porta

**4. Aumentar timeout:**
npm config set timeout 60000

**5. Usar yarn como alternativa:**
npm install -g yarn
yarn install

**6. Configurar registry:**
npm config set registry https://registry.npmjs.org/

**7. Verificar antivírus:**
- Adicionar pasta node_modules na exclusão
- Desabilitar temporariamente para teste

**8. WSL2 (recomendado para desenvolvimento):**
- Instalar WSL2
- Usar terminal Linux para npm install`,
    tags: ['npm', 'install', 'windows', 'permissao', 'troubleshooting'],
    sectionId: 'erros',
    section: { id: 'erros', name: 'Erros' },
    createdAt: '2024-01-19T15:10:00Z',
    updatedAt: '2024-01-19T15:10:00Z'
  }
]