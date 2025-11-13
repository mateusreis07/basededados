# 🗄️ CONFIGURAÇÃO DO BANCO POSTGRESQL

## ✅ Sistema Funcionando com Dados Mockados

O sistema **JÁ ESTÁ FUNCIONANDO** com dados de exemplo! As APIs estão retornando dados mockados temporariamente.

**Para usar com banco PostgreSQL real, siga as instruções abaixo:**

---

## 🚀 OPÇÃO RÁPIDA - Docker (Recomendado)

### 1. Instalar Docker Desktop
- Baixar: https://www.docker.com/products/docker-desktop/
- Instalar e iniciar Docker Desktop

### 2. Executar PostgreSQL
```bash
docker run --name base-conhecimento-db -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=base_conhecimento -p 5432:5432 -d postgres:15
```

### 3. Configurar .env.local
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/base_conhecimento?schema=public"
```

### 4. Executar Migrações
```bash
npm run db:generate
npm run db:push
```

---

## 🔧 OPÇÃO MANUAL - PostgreSQL Windows

### 1. Baixar e Instalar PostgreSQL
- Site: https://www.postgresql.org/download/windows/
- Escolher versão 15 ou superior
- Durante instalação:
  - **Porta**: 5432 (padrão)
  - **Usuário**: postgres
  - **Senha**: Anotar senha definida

### 2. Criar Banco de Dados

**Via pgAdmin (Interface Gráfica):**
1. Abrir pgAdmin 4
2. Conectar com usuário `postgres`
3. Botão direito em "Databases" → "Create" → "Database"
4. Nome: `base_conhecimento`

**Via Linha de Comando:**
```bash
# Abrir CMD/PowerShell
psql -U postgres -h localhost

# No prompt do PostgreSQL:
CREATE DATABASE base_conhecimento;
\q
```

### 3. Configurar .env.local
Substituir `SUA_SENHA` pela senha definida na instalação:
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/base_conhecimento?schema=public"
```

### 4. Executar Migrações
```bash
npm run db:generate
npm run db:push
```

---

## 🔄 MIGRAR DE MOCK PARA BANCO REAL

### 1. Parar o servidor
```bash
Ctrl + C
```

### 2. Configurar arquivo .env.local
Criar/editar `.env.local` na raiz do projeto:
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/base_conhecimento?schema=public"
NODE_ENV="development"
```

### 3. Executar comandos de banco
```bash
npm run db:generate
npm run db:push
```

### 4. Atualizar APIs para usar Prisma
**Descomentar imports do Prisma nos arquivos:**
- `src/app/api/sections/route.ts`
- `src/app/api/items/route.ts`
- `src/app/api/sections/[id]/route.ts`
- `src/app/api/items/[id]/route.ts`

### 5. Reiniciar servidor
```bash
npm run dev
```

---

## 📊 POPULAR BANCO COM DADOS DE EXEMPLO

### Via Prisma Studio (Recomendado)
```bash
npm run db:studio
```
Interface web abrirá em http://localhost:5555 - adicione dados via interface.

### Via SQL Direto
```sql
-- Conectar ao banco e executar:
INSERT INTO "Section" (id, name, description) VALUES
('scripts', 'Scripts PostgreSQL', 'Queries e scripts PostgreSQL'),
('informacoes', 'Informações Gerais', 'Documentação do sistema'),
('erros', 'Erros', 'Troubleshooting e soluções');

INSERT INTO "Item" (id, title, content, tags, "sectionId") VALUES
('1', 'Consultar usuários ativos',
'SELECT u.id, u.name, u.email FROM users u WHERE u.active = true;',
ARRAY['select', 'users'], 'scripts');
```

---

## 🛠️ TROUBLESHOOTING

### ❌ Erro: "Connection refused"
```bash
# Verificar se PostgreSQL está rodando
# Windows: services.msc → PostgreSQL
# Docker: docker ps
```

### ❌ Erro: "Database does not exist"
```sql
# Criar banco manualmente
createdb -U postgres base_conhecimento
```

### ❌ Erro: "Permission denied"
```bash
# Verificar credenciais no .env.local
# Testar conexão:
psql -U postgres -h localhost -d base_conhecimento
```

### ❌ Erro: "Port 5432 already in use"
```bash
# Verificar outros serviços PostgreSQL
netstat -an | findstr :5432
```

---

## 📋 COMANDOS ÚTEIS

```bash
# Verificar status do banco
npm run db:studio

# Reset completo do banco
npx prisma migrate reset

# Aplicar mudanças no schema
npm run db:push

# Ver logs do Docker
docker logs base-conhecimento-db

# Parar container Docker
docker stop base-conhecimento-db

# Iniciar container Docker
docker start base-conhecimento-db
```

---

## 🎯 RESULTADO ESPERADO

Após configurar o banco, o sistema terá:
- ✅ Dados persistentes
- ✅ CRUD completo funcionando
- ✅ Busca no banco real
- ✅ Relacionamentos entre seções e itens
- ✅ Suporte a tags array
- ✅ Timestamps automáticos

**O sistema continuará funcionando normalmente, mas agora com dados reais no PostgreSQL!** 🚀