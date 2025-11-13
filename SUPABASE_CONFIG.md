# 🚀 CONFIGURAÇÃO SUPABASE - Base de Conhecimento

## ✨ Sistema Configurado para Supabase!

O sistema foi **totalmente adaptado** para usar Supabase como banco de dados PostgreSQL. Siga os passos abaixo para conectar.

---

## 📋 PASSO 1: Criar Projeto no Supabase

### 1.1 Acessar Supabase
- Site: https://supabase.com
- Fazer login ou criar conta

### 1.2 Criar Novo Projeto
1. Clicar em "New Project"
2. Escolher organização
3. Preencher informações:
   - **Project Name**: `base-conhecimento`
   - **Database Password**: Criar senha segura (ANOTAR!)
   - **Region**: Escolher mais próxima (ex: South America)
4. Clicar "Create new project"
5. **Aguardar 2-3 minutos** para setup completo

---

## 🔑 PASSO 2: Obter Credenciais

### 2.1 Acessar Database Settings
1. No dashboard do projeto → **Settings** → **Database**
2. Localizar seção **Connection string**

### 2.2 Copiar URLs de Conexão
Você verá algo como:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Exemplo real:**
```
postgresql://postgres:MinhaSenh@123@db.xyzabc123def.supabase.co:5432/postgres
```

---

## ⚙️ PASSO 3: Configurar .env.local

### 3.1 Editar arquivo .env.local
Substituir as URLs no arquivo `.env.local`:

```env
# Substituir [YOUR-PASSWORD] e [YOUR-PROJECT-REF] pelos valores reais
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres"
```

**Exemplo preenchido:**
```env
DATABASE_URL="postgresql://postgres:MinhaSenh@123@db.xyzabc123def.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:MinhaSenh@123@db.xyzabc123def.supabase.co:5432/postgres"
```

### 3.2 Caracteres Especiais na Senha
Se sua senha tem caracteres especiais, codificar em URL:
- `@` → `%40`
- `#` → `%23`
- `&` → `%26`
- `?` → `%3F`

---

## 🗄️ PASSO 4: Aplicar Schema e Dados

### 4.1 Instalar Dependências
```bash
npm install
```

### 4.2 Gerar Cliente Prisma
```bash
npm run db:generate
```

### 4.3 Aplicar Schema ao Supabase
```bash
npm run db:push
```

### 4.4 Popular com Dados de Exemplo
```bash
npm run db:seed
```

---

## 🎯 PASSO 5: Executar Sistema

```bash
npm run dev
```

Acessar: **http://localhost:3000**

---

## ✅ VERIFICAR FUNCIONAMENTO

### 5.1 Testar Navegação
- Página inicial carrega
- Sidebar funciona
- Seções aparecem com contadores

### 5.2 Testar Dados
- Scripts PostgreSQL: deve ter 4 exemplos
- Informações Gerais: deve ter 3 documentos
- Erros: deve ter 3 soluções

### 5.3 Testar Funcionalidades
- Busca em tempo real
- Botões de cópia
- Administração (CRUD)

---

## 🔧 COMANDOS ÚTEIS

```bash
# Ver dados no Prisma Studio
npm run db:studio

# Resetar banco e aplicar seed novamente
npm run db:push --force-reset
npm run db:seed

# Ver logs de erro (se houver)
npm run dev

# Verificar conexão
npx prisma db pull
```

---

## 📊 MONITORAR NO SUPABASE

### Dashboard do Projeto
1. **Database** → **Tables**: Ver tabelas criadas
   - `sections` (seções)
   - `items` (itens)

2. **Database** → **API**: Ver geração automática de APIs

3. **Auth**: Configurar autenticação (futuro)

4. **Storage**: Para uploads (futuro)

---

## 🚨 TROUBLESHOOTING

### ❌ Erro: "Invalid connection string"
- Verificar se DATABASE_URL está correta
- Confirmar senha e project reference
- Testar conexão: `npx prisma db pull`

### ❌ Erro: "Connection timeout"
- Verificar se projeto Supabase está ativo
- Aguardar setup completo (2-3 min após criação)
- Verificar firewall/proxy

### ❌ Erro: "Schema not found"
- Executar: `npm run db:push`
- Verificar permissões do usuário postgres

### ❌ Seed falha
- Verificar se schema foi aplicado primeiro
- Executar: `npm run db:generate`
- Tentar: `npx tsx prisma/seed.ts`

### ❌ Prisma não encontra tabelas
```bash
# Reset completo
npm run db:push --force-reset
npm run db:seed
```

---

## 🎨 RECURSOS SUPABASE EXTRAS

### Row Level Security (RLS)
Para produção, configurar políticas de acesso:
```sql
-- No SQL Editor do Supabase
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "Public read" ON sections FOR SELECT USING (true);
CREATE POLICY "Public read" ON items FOR SELECT USING (true);
```

### Realtime (Opcional)
Habilitar atualizações em tempo real:
1. Database → Replication
2. Habilitar para tabelas `sections` e `items`

---

## 📈 PRÓXIMOS PASSOS

### Deploy em Produção
1. **Vercel** (recomendado):
   - Conectar repositório GitHub
   - Configurar env variables
   - Deploy automático

2. **Variáveis de Ambiente Vercel**:
   - `DATABASE_URL`
   - `DIRECT_URL`

### Melhorias Futuras
- Autenticação com Supabase Auth
- Upload de imagens com Supabase Storage
- Cache com Vercel Edge
- Backups automáticos

---

## 🎉 RESULTADO FINAL

Após configurar corretamente:
- ✅ Sistema conectado ao Supabase
- ✅ Dados persistentes na nuvem
- ✅ CRUD totalmente funcional
- ✅ Busca em banco real
- ✅ Pronto para produção
- ✅ Escalável e rápido

**Supabase Dashboard**: https://app.supabase.com/projects

**Sistema local**: http://localhost:3000

🚀 **Sistema Base de Conhecimento com Supabase funcionando!**