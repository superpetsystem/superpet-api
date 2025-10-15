# SuperPet API 🐾

API REST desenvolvida com NestJS, TypeORM e MySQL para gerenciamento de pets.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js progressivo
- **TypeORM** - ORM para TypeScript e JavaScript
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação com JSON Web Tokens
- **Passport** - Middleware de autenticação
- **bcrypt** - Hash de senhas

## 📋 Pré-requisitos

- Node.js (v18 ou superior)
- MySQL (v8 ou superior)
- npm ou yarn

## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd superpet-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Copie o arquivo template
# Windows (PowerShell)
Copy-Item env\template.env env\local.env

# Linux/Mac
cp env/template.env env/local.env

# Edite o arquivo env/local.env com suas configurações
```

4. Configure o banco de dados MySQL:
```sql
CREATE DATABASE superpet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Execute as migrations:
```bash
npm run migration:run:local
```

6. Execute a aplicação:
```bash
# Modo local (desenvolvimento)
npm run start:local

# Modo staging
npm run start:staging

# Modo produção
npm run start:prod
```

A aplicação estará rodando em `http://localhost:3000`

## 📚 Documentação

### 📖 Guias
- [Guia de Ambientes](./docs/guides/ENVIRONMENTS.md) - Configuração de ambientes (local, staging, production)
- [Guia de Migrations](./docs/guides/MIGRATIONS.md) - Referência completa de comandos de migrations
- [Comandos de Migrations](./docs/guides/MIGRATION-COMMANDS.md) - Referência rápida: aplicar todas de uma vez
- [Workflow de Migrations](./docs/guides/MIGRATIONS-WORKFLOW.md) - Fluxo prático do dia-a-dia com migrations
- [Recuperação de Senha](./docs/guides/PASSWORD-RECOVERY.md) - Change password e forgot/reset password
- [Guia de Scripts](./docs/guides/SCRIPTS.md) - Todos os comandos NPM disponíveis

### 📦 Collections & Exemplos
- [Collection Postman - Auth](./docs/collections/auth/) - Collection completa do Postman para testar Auth
- [Exemplos HTTP](./docs/collections/api-examples.http) - Exemplos de requisições HTTP (REST Client)

## 📁 Estrutura do Projeto

```
├── env/                       # Arquivos de configuração de ambiente
│   ├── local.env             # Configurações locais (gitignored)
│   ├── staging.env           # Configurações staging (gitignored)
│   ├── prod.env              # Configurações produção (gitignored)
│   ├── template.env          # Template para criar novos ambientes
│   └── README.md             # Documentação dos ambientes
├── src/
│   ├── auth/                 # Módulo de autenticação
│   │   ├── decorators/       # Decorators customizados
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── auth-response.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/           # Guards de autenticação
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/       # Estratégias Passport
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── common/               # Recursos compartilhados
│   │   └── entities/
│   │       └── base.entity.ts
│   ├── database/             # Configuração do banco de dados
│   │   ├── migrations/       # Migrations do TypeORM
│   │   │   └── 1729000000000-CreateUsersTable.ts
│   │   ├── data-source.ts    # DataSource para migrations
│   │   └── database.module.ts
│   ├── users/                # Módulo de usuários
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.module.ts
│   │   └── users.repository.ts
│   ├── app.module.ts         # Módulo principal
│   └── main.ts               # Arquivo de inicialização
├── docs/                             # Documentação do projeto
│   ├── README.md                     # Índice da documentação
│   ├── guides/                       # Guias e tutoriais
│   │   ├── ENVIRONMENTS.md           # Guia de ambientes
│   │   ├── MIGRATIONS.md             # Guia de migrations
│   │   ├── MIGRATION-COMMANDS.md     # Comandos de migrations
│   │   ├── MIGRATIONS-WORKFLOW.md    # Workflow de migrations
│   │   ├── PASSWORD-RECOVERY.md      # Recuperação de senha
│   │   └── SCRIPTS.md                # Guia de scripts
│   └── collections/                  # Collections e exemplos
│       ├── auth/                     # Collection do módulo Auth
│       │   ├── SuperPet-Auth.postman_collection.json
│       │   └── README.md
│       └── api-examples.http         # Exemplos REST Client
├── test/                             # Testes
│   ├── automation/                   # Testes de automação E2E
│   │   ├── auth.test.js              # Testes do módulo Auth
│   │   └── README.md                 # Como executar
│   ├── app.e2e-spec.ts               # Testes E2E
│   └── jest-e2e.json                 # Config Jest E2E
└── README.md                         # Documentação principal
```

## 🔐 Endpoints da API

### 📋 Resumo de Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/auth/register` | ❌ | Criar nova conta |
| POST | `/auth/login` | ❌ | Fazer login |
| POST | `/auth/logout` | ✅ | Fazer logout |
| POST | `/auth/refresh` | ❌ | Renovar tokens |
| GET | `/auth/me` | ✅ | Ver perfil do usuário logado |
| PATCH | `/auth/change-password` | ✅ | Trocar senha (com senha atual) |
| POST | `/auth/forgot-password` | ❌ | Solicitar recuperação de senha |
| POST | `/auth/reset-password` | ❌ | Resetar senha com token |

### Autenticação

#### 1. Registro de Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

**Resposta (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  }
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Resposta (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  }
}
```

#### 3. Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

**Resposta (200 OK):**
```json
{
  "message": "Logout successful"
}
```

#### 4. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  }
}
```

#### 5. Ver Perfil (Autenticado)
```http
GET /auth/me
Authorization: Bearer {accessToken}
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "createdAt": "2025-10-14T19:00:00.000Z",
  "updatedAt": "2025-10-14T19:00:00.000Z"
}
```

#### 6. Trocar Senha (Autenticado)
```http
PATCH /auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "senha123",
  "newPassword": "novaSenha123"
}
```

**Resposta (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

#### 7. Solicitar Recuperação de Senha
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Resposta (200 OK):**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Nota:** Por segurança, sempre retorna sucesso mesmo se o email não existir. Em desenvolvimento, o token aparece no console do servidor. Em produção, seria enviado por email.

#### 8. Resetar Senha com Token
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "token_recebido_por_email",
  "newPassword": "novaSenha123"
}
```

**Resposta (200 OK):**
```json
{
  "message": "Password has been reset successfully"
}
```

**Nota:** O token é válido por 1 hora e pode ser usado apenas uma vez.

## 🔒 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Existem dois tipos de tokens:

- **Access Token**: Validade de 15 minutos, usado para acessar rotas protegidas
- **Refresh Token**: Validade de 7 dias, usado para obter novos access tokens

### Como usar tokens protegidos

Para acessar rotas protegidas, inclua o access token no header:

```http
Authorization: Bearer {accessToken}
```

### Rotas Públicas

Use o decorator `@Public()` para marcar rotas que não precisam de autenticação.

### Obter usuário atual

Use o decorator `@CurrentUser()` em rotas protegidas para obter os dados do usuário autenticado:

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: any) {
  return user;
}
```

## 🛠️ Configuração de Ambiente

### Ambientes Suportados

A aplicação suporta múltiplos ambientes com arquivos na pasta `env/`:
- **Local**: `env/local.env` - Desenvolvimento local
- **Staging**: `env/staging.env` - Ambiente de testes
- **Production**: `env/prod.env` - Ambiente de produção

### Arquivo de Configuração (`env/local.env`)

```env
# Environment
NODE_ENV=local

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=superpet_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3000
```

⚠️ **IMPORTANTE**: 
- Todos os arquivos de ambiente estão em `env/`
- Nomes dos arquivos: `local.env`, `staging.env`, `prod.env`
- Altere os valores de `JWT_SECRET` e `JWT_REFRESH_SECRET` em staging e produção!
- Use secrets de no mínimo 32 caracteres
- Nunca commite arquivos `env/*.env` no git (exceto `template.env`)
- Use `cross-env` para compatibilidade Windows/Linux/Mac

📖 **Guia completo de ambientes:** [ENVIRONMENTS.md](./docs/guides/ENVIRONMENTS.md)

## 🧪 Testes

### Testes Unitários
```bash
# Executar todos os testes unitários
npm run test

# Watch mode
npm run test:watch

# Com cobertura
npm run test:cov
```

### Testes E2E
```bash
npm run test:e2e
```

### Testes de Automação (API)
```bash
# Testar módulo Auth completo (16 testes)
npm run test:automation

# Ou especificamente Auth
npm run test:automation:auth
```

**O que testa:**
- ✅ Todos endpoints de Auth (8 endpoints)
- ✅ Casos de sucesso (happy path)
- ✅ Casos de erro (validações)
- ✅ Fluxos completos (register → login → logout)

📖 **Ver detalhes:** [test/automation/README.md](./test/automation/README.md)

## 📝 Comandos Úteis

### Desenvolvimento

```bash
# Local (desenvolvimento com hot-reload)
npm run start:local

# Debug
npm run start:debug

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

### Migrations

```bash
# Criar migration vazia
npm run migration:create src/database/migrations/NomeDaMigration

# Gerar migration automaticamente (local)
npm run migration:generate:local src/database/migrations/NomeDaMigration

# Ver migrations pendentes ANTES de aplicar
npm run migration:pending:local       # Local
npm run migration:pending:staging     # Staging
npm run migration:pending:production  # Production

# Aplicar TODAS as migrations pendentes de uma vez
npm run migration:apply:all:local       # Local
npm run migration:apply:all:staging     # Staging
npm run migration:apply:all:production  # Production

# Reverter última migration
npm run migration:revert:local
npm run migration:revert:staging
npm run migration:revert:production

# Ver status das migrations (executadas + pendentes)
npm run migration:show:local
npm run migration:show:staging
npm run migration:show:production
```

📖 **Veja o guia completo:** [MIGRATIONS.md](./docs/guides/MIGRATIONS.md)

### Ambientes

```bash
# Local (desenvolvimento)
npm run start:local

# Staging
npm run start:staging

# Production
npm run start:prod
```

📖 **Veja o guia completo:** [ENVIRONMENTS.md](./docs/guides/ENVIRONMENTS.md)

## 🔄 Migrations

O projeto usa **TypeORM Migrations** para gerenciar o schema do banco de dados de forma controlada e versionada.

### Comandos Principais

```bash
# Criar migration
npm run migration:create src/database/migrations/NomeDaMigration

# Gerar migration automaticamente
npm run migration:generate:local src/database/migrations/NomeDaMigration

# Aplicar migrations
npm run migration:run:local

# Reverter última migration
npm run migration:revert:local

# Ver status
npm run migration:show:local
```

📖 **Guia completo de migrations:** [MIGRATIONS.md](./docs/guides/MIGRATIONS.md)

### Fluxo de Trabalho

1. Modificar/criar entity
2. Gerar migration: `npm run migration:generate:local src/database/migrations/NomeMigration`
3. Revisar migration gerada
4. Aplicar: `npm run migration:run:local`
5. Testar
6. Commit e push

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## ✨ Features Implementadas

- ✅ Módulo de Autenticação completo
- ✅ JWT com Access e Refresh Tokens
- ✅ Recuperação de senha (Forgot/Reset)
- ✅ Troca de senha (Change Password)
- ✅ TypeORM com Migrations
- ✅ Múltiplos ambientes (local, staging, prod)
- ✅ Validações com class-validator
- ✅ Guards e Decorators customizados
- ✅ Collection Postman completa
- ✅ Testes de automação E2E
- ✅ Documentação completa

## ✨ Próximos Passos

- [ ] Implementar módulo de Pets
- [ ] Adicionar validações de email (confirmação)
- [ ] Envio de emails (integração com SendGrid/AWS SES)
- [ ] Adicionar refresh token rotation
- [ ] Implementar rate limiting
- [ ] Adicionar documentação Swagger/OpenAPI
- [ ] Implementar testes unitários (Jest)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Adicionar logs estruturados (Winston)
- [ ] Implementar health checks
- [ ] Adicionar 2FA (Two-Factor Authentication)

---

Desenvolvido com ❤️ usando NestJS
