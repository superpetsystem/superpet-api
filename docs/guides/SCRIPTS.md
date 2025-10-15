# 📜 Guia de Scripts - SuperPet API

Este documento lista todos os scripts NPM disponíveis no projeto e como usá-los.

## 🚀 Scripts de Aplicação

### Local (Desenvolvimento)

```bash
# Inicia a aplicação em modo local com hot-reload
npm run start:local
```
- Usa `cross-env NODE_ENV=local`
- Carrega `env/local.env` automaticamente
- Hot-reload habilitado (código atualiza automaticamente)
- Ideal para desenvolvimento local

### Debug

```bash
# Inicia em modo debug
npm run start:debug
```
- Mesmas configurações que `start:local`
- Adiciona suporte para debugging
- Use com VS Code debugger ou Chrome DevTools

### Staging

```bash
# Build da aplicação
npm run build

# Inicia em modo staging
npm run start:staging
```
- Usa `cross-env NODE_ENV=staging`
- Carrega `env/staging.env`
- Executa código compilado de `dist/`
- Sem hot-reload

### Production

```bash
# Build da aplicação
npm run build

# Inicia em modo produção
npm run start:prod
```
- Usa `cross-env NODE_ENV=production`
- Carrega `env/prod.env`
- Executa código compilado de `dist/`
- Sem hot-reload

---

## 🗄️ Scripts de Migrations

### Criar Migration Vazia

```bash
npm run migration:create src/database/migrations/NomeDaMigration
```

**Exemplo:**
```bash
npm run migration:create src/database/migrations/AddPhoneToUsers
```

Cria arquivo: `src/database/migrations/1234567890123-AddPhoneToUsers.ts`

### Gerar Migration Automaticamente

Compara suas entities com o banco de dados atual e gera a migration automaticamente.

#### Local
```bash
npm run migration:generate:local src/database/migrations/NomeDaMigration
```

**Exemplo:**
```bash
npm run migration:generate:local src/database/migrations/AddPetsTable
```

#### Staging
```bash
npm run migration:generate:staging src/database/migrations/NomeDaMigration
```

#### Production
```bash
npm run migration:generate:production src/database/migrations/NomeDaMigration
```

### Aplicar Migrations

#### Local
```bash
npm run migration:run:local
```
Aplica todas as migrations pendentes no banco local.

#### Staging
```bash
npm run migration:run:staging
```
Aplica todas as migrations pendentes no banco de staging.

#### Production
```bash
npm run migration:run:production
```
Aplica todas as migrations pendentes no banco de produção.

### Reverter Migrations

#### Local
```bash
npm run migration:revert:local
```
Reverte a última migration executada no banco local.

#### Staging
```bash
npm run migration:revert:staging
```
Reverte a última migration executada no banco de staging.

#### Production
```bash
npm run migration:revert:production
```
⚠️ **CUIDADO:** Reverte a última migration em produção. Faça backup antes!

### Ver Status das Migrations

#### Local
```bash
npm run migration:show:local
```
Lista todas as migrations e seus status (executada ou pendente).

**Output exemplo:**
```
[X] CreateUsersTable1729000000000
[X] AddPetsTable1729000000001
[ ] AddPhoneToUsers1729000000002
```

#### Staging
```bash
npm run migration:show:staging
```

#### Production
```bash
npm run migration:show:production
```

---

## 🧪 Scripts de Testes

### Testes Unitários

```bash
# Executar todos os testes
npm run test

# Executar em modo watch (re-executa ao salvar)
npm run test:watch

# Executar com coverage
npm run test:cov

# Debug de testes
npm run test:debug
```

### Testes E2E

```bash
npm run test:e2e
```

---

## 🛠️ Scripts de Qualidade de Código

### Linting

```bash
# Executar ESLint e corrigir problemas automaticamente
npm run lint
```

### Formatação

```bash
# Formatar código com Prettier
npm run format
```

---

## 🔧 Scripts Utilitários

### Build

```bash
npm run build
```
Compila o TypeScript para JavaScript na pasta `dist/`.

### TypeORM CLI

```bash
# Acesso direto ao CLI do TypeORM
npm run typeorm -- [comando]
```

**Exemplos:**
```bash
# Ver todas as opções
npm run typeorm -- --help

# Ver entities
npm run typeorm -- -d src/database/data-source.ts query "SHOW TABLES"
```

### Schema Operations (⚠️ CUIDADO)

```bash
# Dropar todo o schema (APAGA TUDO!)
npm run schema:drop

# Sincronizar schema (não recomendado em produção)
npm run schema:sync
```

⚠️ **ATENÇÃO:** Estes comandos são DESTRUTIVOS e devem ser usados com extremo cuidado!

---

## 📋 Referência Rápida

| Script | Descrição | Ambiente |
|--------|-----------|----------|
| `npm run start:local` | Desenvolvimento com hot-reload | Local |
| `npm run start:debug` | Desenvolvimento com debugger | Local |
| `npm run start:staging` | Produção em staging | Staging |
| `npm run start:prod` | Produção | Production |
| `npm run build` | Compilar projeto | Todos |
| `npm run lint` | Verificar código | Todos |
| `npm run format` | Formatar código | Todos |
| `npm run test` | Testes unitários | Todos |
| `npm run test:e2e` | Testes E2E | Todos |
| `npm run migration:create` | Criar migration vazia | Todos |
| `npm run migration:generate:local` | Gerar migration (local) | Local |
| `npm run migration:run:local` | Aplicar migrations (local) | Local |
| `npm run migration:revert:local` | Reverter migration (local) | Local |
| `npm run migration:show:local` | Ver status (local) | Local |
| `npm run migration:run:staging` | Aplicar migrations (staging) | Staging |
| `npm run migration:run:production` | Aplicar migrations (prod) | Production |

---

## 🎯 Fluxos de Trabalho Comuns

### Início do Dia (Desenvolvimento)

```bash
# 1. Atualizar código
git pull

# 2. Instalar dependências (se houve mudanças)
npm install

# 3. Aplicar migrations
npm run migration:run:local

# 4. Iniciar aplicação
npm run start:local
```

### Criar Nova Feature

```bash
# 1. Desenvolver código e entities

# 2. Gerar migration
npm run migration:generate:local src/database/migrations/NomeDaFeature

# 3. Revisar migration gerada

# 4. Aplicar migration
npm run migration:run:local

# 5. Testar
npm run test

# 6. Verificar linting
npm run lint

# 7. Commit
git add .
git commit -m "feat: descrição da feature"
git push
```

### Deploy para Staging

```bash
# No servidor de staging

# 1. Atualizar código
git pull origin develop

# 2. Instalar dependências
npm install

# 3. Build
npm run build

# 4. Aplicar migrations
npm run migration:run:staging

# 5. Reiniciar aplicação
pm2 restart superpet-api-staging
# ou
npm run start:staging
```

### Deploy para Production

```bash
# No servidor de produção

# 1. FAZER BACKUP DO BANCO!
mysqldump -u root -p superpet_prod_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Atualizar código
git pull origin main

# 3. Instalar dependências (production only)
npm install --production

# 4. Build
npm run build

# 5. Ver migrations pendentes
npm run migration:show:production

# 6. Aplicar migrations
npm run migration:run:production

# 7. Reiniciar aplicação
pm2 restart superpet-api-production
# ou
npm run start:prod
```

### Reverter Mudanças (Rollback)

```bash
# 1. Reverter migration
npm run migration:revert:production

# 2. Voltar para versão anterior do código
git checkout [commit-hash-anterior]

# 3. Build
npm run build

# 4. Reiniciar aplicação
pm2 restart superpet-api-production
```

---

## 🐛 Debug com VS Code

Adicione ao `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector",
      "env": {
        "NODE_ENV": "local"
      }
    }
  ]
}
```

Depois use F5 ou Run > Start Debugging.

---

## 📝 Notas Importantes

### cross-env

Todos os scripts que definem `NODE_ENV` usam `cross-env` para garantir compatibilidade entre:
- Windows (PowerShell e CMD)
- Linux
- macOS

### Ordem de Execução

Para evitar problemas, sempre execute na ordem:

1. `npm install` (se houver mudanças em dependencies)
2. `npm run migration:run:[ambiente]`
3. `npm run build` (para staging/production)
4. `npm run start:[ambiente]`

### Performance

Scripts de development (`start:local`) são mais lentos pois:
- Usam `ts-node` (compila on-the-fly)
- Têm hot-reload habilitado
- Incluem source maps

Scripts de production são mais rápidos pois:
- Usam JavaScript pré-compilado
- Sem overhead de hot-reload
- Código otimizado

---

Desenvolvido com ❤️ para SuperPet API

