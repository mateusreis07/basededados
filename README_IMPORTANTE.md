# ⚠️ INSTRUÇÕES IMPORTANTES - Base de Conhecimento

## 🚨 PROBLEMA ATUAL: Versão do Node.js

O sistema detectou Node.js v18.19.1, mas o Next.js 16.0.1 requer Node.js ≥20.9.0.

### ✅ SOLUÇÃO: Atualizar Node.js

#### Windows:
1. Baixar Node.js 20.x LTS: https://nodejs.org/
2. Executar instalador como Administrador
3. Reiniciar terminal/PowerShell
4. Verificar: `node --version` (deve ser ≥20.9.0)

#### Alternativa - Usar NVM (Recomendado):
```bash
# Instalar NVM para Windows
# Baixar: https://github.com/coreybutler/nvm-windows

# Instalar Node 20
nvm install 20
nvm use 20
```

## 📋 PRÓXIMOS PASSOS (Após atualizar Node.js)

### 1. Instalar Dependências
```bash
cd base-conhecimento
npm install
```

### 2. Configurar PostgreSQL

#### Opção Rápida - Docker (Recomendado):
```bash
docker run --name postgres-base -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=base_conhecimento -p 5432:5432 -d postgres:15
```

#### Opção Manual - PostgreSQL Windows:
1. Instalar: https://www.postgresql.org/download/windows/
2. Criar banco: `base_conhecimento`
3. Anotar usuário/senha

### 3. Configurar .env.local
Editar arquivo `.env.local`:
```env
# Para Docker:
DATABASE_URL="postgresql://postgres:123456@localhost:5432/base_conhecimento?schema=public"

# Para instalação manual:
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/base_conhecimento?schema=public"
```

### 4. Configurar Banco
```bash
npm run db:generate
npm run db:push
```

### 5. Executar Sistema
```bash
npm run dev
```

Sistema disponível em: **http://localhost:3000**

## 🎯 FUNCIONALIDADES CRIADAS

### ✅ Páginas Implementadas:
- **/** - Página inicial com navegação
- **/scripts** - Scripts PostgreSQL com busca e cópia
- **/informacoes** - Informações gerais do sistema
- **/erros** - Base de erros e soluções
- **/admin** - Administração (CRUD de conteúdo)

### ✅ Componentes:
- **Sidebar** - Navegação lateral
- **SearchBar** - Busca em tempo real
- **CopyButton** - Botão para copiar código/texto

### ✅ API Routes:
- `GET/POST /api/sections` - Gerenciar seções
- `GET/POST /api/items` - Gerenciar itens
- Suporte a busca por título, conteúdo e tags

### ✅ Banco de Dados:
- Schema Prisma configurado
- Tabelas: `Section` e `Item`
- Relacionamento 1:N entre seções e itens
- Suporte a tags array

## 🔧 SCRIPTS DISPONÍVEIS

```bash
npm run dev         # Desenvolvimento (localhost:3000)
npm run build       # Build produção
npm run start       # Executar build
npm run db:generate # Gerar cliente Prisma
npm run db:push     # Aplicar schema
npm run db:studio   # Interface visual banco
```

## 🎨 DESIGN E UX

- **Responsivo**: Tailwind CSS
- **Dark Theme**: Para códigos PostgreSQL
- **Icons**: Emojis para seções
- **Feedback**: Animações de loading e sucesso
- **Busca**: Filtros em tempo real

## 📝 COMO USAR

1. **Acessar sistema**: http://localhost:3000
2. **Adicionar conteúdo**: Ir em "Administração"
3. **Pesquisar**: Usar barra de busca em cada seção
4. **Copiar código**: Clicar botão "Copiar" nos scripts

## 🚀 PRÓXIMAS MELHORIAS POSSÍVEIS

- Autenticação de usuários
- Histórico de versões dos itens
- Export/Import de dados
- Temas personalizados
- Favoritos
- Compartilhamento de links

## 📞 SUPORTE

Se encontrar problemas:
1. Verificar versão Node.js: `node --version`
2. Verificar PostgreSQL rodando
3. Confirmar .env.local configurado
4. Limpar cache: `npm cache clean --force`

---

**Sistema criado com Next.js 16, TypeScript, Prisma e PostgreSQL**
**Pronto para uso em ambiente Windows localhost** 🎉