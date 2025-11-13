# 📚 Base de Conhecimento - Sistema Completo

Sistema de gestão de conhecimento construído com **Next.js**, **TypeScript**, **Prisma** e **Supabase**.

## 🚀 Funcionalidades

- ✅ **Scripts PostgreSQL** com busca e cópia de código
- ✅ **Informações Gerais** para documentação do sistema
- ✅ **Base de Erros** para troubleshooting
- ✅ **Painel Administrativo** para gerenciar conteúdo
- ✅ **Busca em tempo real** por título, conteúdo e tags
- ✅ **Interface responsiva** com Tailwind CSS
- ✅ **Banco na nuvem** com Supabase PostgreSQL

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS 3.4
- **Backend**: API Routes do Next.js
- **Banco**: Supabase (PostgreSQL Cloud)
- **ORM**: Prisma
- **Deploy**: Vercel (recomendado)

## ⚡ Início Rápido

### 1. Clonar e Instalar
```bash
git clone <repository-url>
cd base-conhecimento
npm install
```

### 2. Configurar Supabase
Siga o guia completo: **[SUPABASE_CONFIG.md](./SUPABASE_CONFIG.md)**

### 3. Configurar Ambiente
Editar `.env.local`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### 4. Setup do Banco
```bash
npm run db:generate  # Gerar cliente Prisma
npm run db:push     # Aplicar schema
npm run db:seed     # Popular com dados de exemplo
```

### 5. Executar
```bash
npm run dev
```
Acessar: **http://localhost:3000**

## 📋 Scripts Disponíveis

```bash
npm run dev         # Desenvolvimento (localhost:3000)
npm run build       # Build para produção
npm run start       # Executar build de produção
npm run lint        # Executar ESLint

# Banco de Dados
npm run db:generate # Gerar cliente Prisma
npm run db:push     # Aplicar schema ao Supabase
npm run db:studio   # Interface visual do banco
npm run db:seed     # Popular banco com dados de exemplo
```

## 📁 Estrutura do Projeto

```
base-conhecimento/
├── src/
│   ├── app/
│   │   ├── api/          # API Routes (CRUD)
│   │   ├── scripts/      # Página Scripts PostgreSQL
│   │   ├── informacoes/  # Página Informações Gerais
│   │   ├── erros/        # Página Base de Erros
│   │   └── admin/        # Página Administração
│   ├── components/       # Componentes React
│   │   ├── Sidebar.tsx   # Navegação lateral
│   │   ├── SearchBar.tsx # Barra de busca
│   │   └── CopyButton.tsx# Botão de cópia
│   └── lib/             # Utilitários
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── seed.ts          # Dados iniciais
└── docs/                # Documentação
```

## 🎯 Como Usar

### 📝 Adicionar Conteúdo
1. Acessar `/admin`
2. Selecionar seção
3. Clicar "Adicionar Novo Item"
4. Preencher formulário
5. Salvar

### 🔍 Pesquisar
- Usar barra de busca em cada seção
- Pesquisa por título, conteúdo e tags
- Filtros em tempo real

### 📋 Copiar Scripts
- Clicar botão "Copiar" em qualquer item
- Código/texto vai para área de transferência
- Feedback visual de sucesso

## 🗄️ Banco de Dados

### Modelos
- **Section**: Seções do sistema (Scripts, Informações, Erros)
- **Item**: Itens de conteúdo dentro das seções

### Relacionamentos
- Uma seção tem muitos itens
- Cada item pertence a uma seção
- Suporte a tags array por item

### Dados de Exemplo Inclusos
- **4 Scripts PostgreSQL** úteis
- **3 Documentos informativos**
- **3 Soluções de troubleshooting**

## 🔧 APIs Disponíveis

### Seções
- `GET /api/sections` - Listar todas as seções
- `POST /api/sections` - Criar nova seção
- `GET /api/sections/[id]` - Buscar seção específica
- `PUT /api/sections/[id]` - Atualizar seção
- `DELETE /api/sections/[id]` - Deletar seção

### Itens
- `GET /api/items?sectionId=x` - Listar itens de uma seção
- `GET /api/items?search=query` - Buscar itens
- `POST /api/items` - Criar novo item
- `GET /api/items/[id]` - Buscar item específico
- `PUT /api/items/[id]` - Atualizar item
- `DELETE /api/items/[id]` - Deletar item

## 🎨 Interface

- **Design responsivo** para mobile e desktop
- **Sidebar fixa** com navegação intuitiva
- **Cores temáticas** por seção
- **Syntax highlighting** para código PostgreSQL
- **Loading states** e **feedback visual**
- **Dark theme** para exibição de código

## 🚀 Deploy

### Vercel (Recomendado)
1. Conectar repositório no GitHub
2. Importar no Vercel
3. Configurar variáveis de ambiente:
   - `DATABASE_URL`
   - `DIRECT_URL`
4. Deploy automático

### Outras Plataformas
- Netlify
- Railway
- Heroku

## 📚 Documentação

- **[SUPABASE_CONFIG.md](./SUPABASE_CONFIG.md)** - Configuração completa do Supabase
- **[SISTEMA_FUNCIONANDO.md](./SISTEMA_FUNCIONANDO.md)** - Status e funcionalidades
- **[CORRECAO_URGENTE.md](./CORRECAO_URGENTE.md)** - Correções do Tailwind CSS

## 🤝 Contribuição

1. Fork o projeto
2. Criar branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit das mudanças (`git commit -m 'feat: nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Abrir Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verificar documentação em `/docs`
2. Consultar seção "Erros" do sistema
3. Abrir issue no GitHub

---

**Base de Conhecimento** - Sistema completo para gestão de conhecimento técnico 🚀
