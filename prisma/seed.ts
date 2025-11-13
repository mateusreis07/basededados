import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.item.deleteMany()
  await prisma.section.deleteMany()
  await prisma.sectionTypeGroup.deleteMany()

  // Criar tipos de seção padrão
  const sectionTypes = await prisma.sectionTypeGroup.createMany({
    data: [
      {
        name: 'SEÇÕES PRINCIPAIS',
        description: 'Seções principais da base de conhecimento',
        icon: '⭐',
        color: '#3B82F6',
        order: 1,
        active: true,
        sectionFilter: 'MENU'
      },
      {
        name: 'SEÇÕES FIXAS',
        description: 'Seções fixas e permanentes do sistema',
        icon: '📌',
        color: '#10B981',
        order: 2,
        active: true,
        sectionFilter: 'FIXED'
      },
      {
        name: 'SEÇÕES PERSONALIZADAS',
        description: 'Seções criadas pelos usuários conforme necessidade',
        icon: '🎨',
        color: '#8B5CF6',
        order: 3,
        active: true,
        sectionFilter: 'CUSTOM'
      }
    ]
  })

  console.log('🎨 Tipos de seção criados com sucesso!')

  // Criar seções
  const scriptsSection = await prisma.section.create({
    data: {
      id: 'scripts',
      name: 'Scripts PostgreSQL',
      description: 'Queries e scripts PostgreSQL',
    },
  })

  const informacoesSection = await prisma.section.create({
    data: {
      id: 'informacoes',
      name: 'Informações Gerais',
      description: 'Documentação do sistema',
    },
  })

  const errosSection = await prisma.section.create({
    data: {
      id: 'erros',
      name: 'Erros',
      description: 'Troubleshooting e soluções',
    },
  })

  console.log('📁 Seções criadas com sucesso!')

  // Criar itens para Scripts PostgreSQL
  await prisma.item.createMany({
    data: [
      {
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
        sectionId: scriptsSection.id,
      },
      {
        title: 'Backup de tabela específica',
        content: `-- Fazer backup de uma tabela específica
pg_dump -h localhost -U postgres -t usuarios base_conhecimento > backup_usuarios.sql

-- Restaurar backup
psql -h localhost -U postgres -d base_conhecimento < backup_usuarios.sql`,
        tags: ['backup', 'pg_dump', 'restore', 'postgresql'],
        sectionId: scriptsSection.id,
      },
      {
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
        sectionId: scriptsSection.id,
      },
      {
        title: 'Listar tabelas por tamanho',
        content: `SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;`,
        tags: ['size', 'tables', 'monitoring', 'postgresql'],
        sectionId: scriptsSection.id,
      },
    ],
  })

  // Criar itens para Informações Gerais
  await prisma.item.createMany({
    data: [
      {
        title: 'Configuração do Ambiente de Desenvolvimento',
        content: `**Requisitos do Sistema:**

- Node.js 20.9.0 ou superior
- Supabase (PostgreSQL Cloud)
- Git
- Editor de código (VS Code recomendado)

**Variáveis de Ambiente:**
Criar arquivo .env.local com:

DATABASE_URL="sua_database_url_do_supabase"
DIRECT_URL="sua_direct_url_do_supabase"
NODE_ENV="development"

**Extensões VS Code Recomendadas:**
- Prisma (Prisma.prisma)
- Tailwind CSS IntelliSense
- TypeScript Importer
- Thunder Client (para testar APIs)

**Comandos Importantes:**
npm run db:generate - Gerar cliente Prisma
npm run db:push - Aplicar schema ao Supabase
npm run db:studio - Interface visual do banco
npm run dev - Executar em desenvolvimento`,
        tags: ['configuracao', 'ambiente', 'setup', 'supabase'],
        sectionId: informacoesSection.id,
      },
      {
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

**API Routes:**
- GET /api/sections - Listar seções
- POST /api/sections - Criar seção
- GET /api/items?sectionId=x - Listar itens
- POST /api/items - Criar item
- PUT /api/items/[id] - Atualizar item
- DELETE /api/items/[id] - Deletar item

**Git Commit Pattern:**
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes`,
        tags: ['codigo', 'padrao', 'nomenclatura', 'git', 'api'],
        sectionId: informacoesSection.id,
      },
      {
        title: 'Arquitetura do Sistema',
        content: `**Stack Tecnológica:**

- Frontend: Next.js 16 + TypeScript
- Styling: Tailwind CSS 3.4
- Banco: Supabase (PostgreSQL)
- ORM: Prisma
- Deploy: Vercel (recomendado)

**Estrutura de Pastas:**

/src
  /app
    /api         # API Routes
    /components  # Componentes React
    /scripts     # Página Scripts
    /admin       # Página Admin
  /lib           # Utilitários
/prisma          # Schema e migrations

**Fluxo de Dados:**

1. Componente → Fetch API
2. API Route → Prisma
3. Prisma → Supabase
4. Response → Componente
5. Estado atualizado

**Segurança:**

- Validação de entrada nas APIs
- Sanitização de dados
- Rate limiting (futuro)
- Autenticação (futuro)`,
        tags: ['arquitetura', 'stack', 'estrutura', 'seguranca'],
        sectionId: informacoesSection.id,
      },
    ],
  })

  // Criar itens para Erros
  await prisma.item.createMany({
    data: [
      {
        title: 'Erro: Connection timeout Supabase',
        content: `**Problema:**
Timeout ao conectar com Supabase - "connection timeout"

**Possíveis Causas:**
1. URL de conexão incorreta
2. Pool de conexões esgotado
3. Firewall bloqueando conexão
4. Configurações de timeout muito baixas

**Soluções:**

**1. Verificar URLs no .env.local:**
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

**2. Testar conexão:**
- Acessar Supabase Dashboard
- Verificar se projeto está ativo
- Testar com Prisma Studio

**3. Regenerar senha do banco:**
- Supabase Dashboard → Settings → Database
- Reset database password

**4. Verificar pool de conexões:**
- Adicionar ?pgbouncer=true na URL se necessário
- Usar DIRECT_URL para migrations

**5. Restart do projeto:**
npm run dev`,
        tags: ['supabase', 'timeout', 'connection', 'troubleshooting'],
        sectionId: errosSection.id,
      },
      {
        title: 'Erro: Prisma generate falha',
        content: `**Problema:**
npx prisma generate falha ou schema inválido

**Soluções:**

**1. Limpar cache Prisma:**
npx prisma generate --force
rm -rf node_modules/.prisma
npm install

**2. Verificar schema.prisma:**
- Sintaxe correta
- Modelos bem definidos
- Relacionamentos válidos

**3. Verificar versões:**
npm list @prisma/client
npm list prisma

**4. Reinstalar Prisma:**
npm uninstall @prisma/client prisma
npm install @prisma/client prisma

**5. Verificar DATABASE_URL:**
- URL válida do Supabase
- Credenciais corretas
- Formato: postgresql://...

**6. Erro de tipos:**
- Deletar node_modules/@types
- npm install
- Restart do TypeScript server

**7. Reset completo:**
rm -rf node_modules package-lock.json
npm install
npx prisma generate`,
        tags: ['prisma', 'generate', 'schema', 'troubleshooting'],
        sectionId: errosSection.id,
      },
      {
        title: 'Erro: API retorna 500 após deploy',
        content: `**Problema:**
APIs funcionam local, mas retornam 500 em produção

**Soluções:**

**1. Verificar variáveis de ambiente:**
- Vercel Dashboard → Project → Settings → Environment Variables
- Adicionar DATABASE_URL e DIRECT_URL
- Redeploy após adicionar

**2. Verificar logs de erro:**
Vercel Dashboard → Project → Functions → View Logs

**3. Configuração do Supabase:**
- Verificar IP allowlist
- Permitir conexões externas
- Verificar região do projeto

**4. Prisma em produção:**
- Verificar se generate roda no build
- Adicionar postinstall script:
"postinstall": "prisma generate"

**5. Timeout de função:**
- Vercel tem limit de 10s (hobby)
- Otimizar queries lentas
- Verificar pool de conexões

**6. Cold starts:**
- Primeiras requisições podem ser lentas
- Implementar cache quando possível

**7. Debug produção:**
- Adicionar console.error() nas APIs
- Verificar response headers
- Testar endpoints individualmente`,
        tags: ['deploy', 'vercel', '500', 'producao', 'troubleshooting'],
        sectionId: errosSection.id,
      },
    ],
  })

  console.log('📝 Itens criados com sucesso!')

  // Verificar dados criados
  const sectionTypesCount = await prisma.sectionTypeGroup.count()
  const sectionsCount = await prisma.section.count()
  const itemsCount = await prisma.item.count()

  console.log(`✅ Seed concluído!`)
  console.log(`🎨 ${sectionTypesCount} tipos de seção criados`)
  console.log(`📁 ${sectionsCount} seções criadas`)
  console.log(`📝 ${itemsCount} itens criados`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })