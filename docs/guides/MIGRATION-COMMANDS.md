# 📋 Referência Rápida de Comandos - Migrations

Guia rápido de todos os comandos de migrations disponíveis.

---

## 🎯 Comandos Principais

### Aplicar TODAS as Migrations Pendentes

```bash
# Local
npm run migration:apply:all:local
# ou
npm run migration:run:local

# Staging
npm run migration:apply:all:staging
# ou
npm run migration:run:staging

# Production
npm run migration:apply:all:production
# ou
npm run migration:run:production
```

**O que faz:** Aplica automaticamente **TODAS** as migrations que ainda não foram executadas no banco de dados.

**⚠️ IMPORTANTE:** Sempre verifique quais migrations serão aplicadas antes usando `migration:pending`!

---

### Ver Migrations Pendentes

```bash
# Local
npm run migration:pending:local
# ou
npm run migration:show:local

# Staging
npm run migration:pending:staging
# ou
npm run migration:show:staging

# Production
npm run migration:pending:production
# ou
npm run migration:show:production
```

**O que faz:** Mostra quais migrations já foram aplicadas e quais estão pendentes.

**Output exemplo:**
```
[X] CreateUsersTable1729000000000
[X] AddResetPasswordFieldsToUsers1760484608080
[ ] AddPetsTable1760484700000  ← Pendente
```

---

## 📝 Criar/Gerar Migrations

### Criar Migration Vazia (Manual)

```bash
npm run migration:create src/database/migrations/NomeDaMigration
```

### Gerar Migration Automática (Recomendado)

```bash
# Local
npm run migration:generate:local src/database/migrations/NomeDaMigration

# Staging
npm run migration:generate:staging src/database/migrations/NomeDaMigration

# Production
npm run migration:generate:production src/database/migrations/NomeDaMigration
```

---

## ↩️ Reverter Migrations

### Reverter Última Migration

```bash
# Local
npm run migration:revert:local

# Staging
npm run migration:revert:staging

# Production (CUIDADO!)
npm run migration:revert:production
```

**⚠️ ATENÇÃO:** Reverte apenas a **última** migration executada. Para reverter múltiplas, execute o comando várias vezes.

---

## 🔄 Fluxo Completo Recomendado

### Desenvolvimento Local

```bash
# 1. Modificar entity

# 2. Gerar migration
npm run migration:generate:local src/database/migrations/NomeDaMigration

# 3. Revisar migration gerada

# 4. Ver o que será aplicado
npm run migration:pending:local

# 5. Aplicar todas pendentes
npm run migration:apply:all:local

# 6. Confirmar aplicação
npm run migration:show:local
```

---

### Deploy Staging

```bash
# No servidor de staging

# 1. Atualizar código
git pull origin develop
npm install
npm run build

# 2. Ver migrations pendentes
npm run migration:pending:staging

# 3. Aplicar todas
npm run migration:apply:all:staging

# 4. Confirmar
npm run migration:show:staging

# 5. Reiniciar app
npm run start:staging
```

---

### Deploy Production

```bash
# No servidor de produção

# 1. BACKUP DO BANCO!
mysqldump -u root -p superpet_prod_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Atualizar código
git pull origin main
npm install --production
npm run build

# 3. Ver migrations pendentes (CRÍTICO!)
npm run migration:pending:production

# 4. Revisar cada migration manualmente

# 5. Aplicar todas
npm run migration:apply:all:production

# 6. Confirmar
npm run migration:show:production

# 7. Reiniciar app
pm2 restart superpet-api-production
```

---

## 📊 Tabela de Comandos

| Comando | Local | Staging | Production |
|---------|-------|---------|------------|
| **Criar migration vazia** | `migration:create` | `migration:create` | `migration:create` |
| **Gerar migration auto** | `migration:generate:local` | `migration:generate:staging` | `migration:generate:production` |
| **Ver pendentes** | `migration:pending:local` | `migration:pending:staging` | `migration:pending:production` |
| **Aplicar todas** | `migration:apply:all:local` | `migration:apply:all:staging` | `migration:apply:all:production` |
| **Reverter última** | `migration:revert:local` | `migration:revert:staging` | `migration:revert:production` |
| **Ver status** | `migration:show:local` | `migration:show:staging` | `migration:show:production` |

---

## ❓ FAQ

### Q: O que significa "aplicar todas"?

**A:** Executa **todas** as migrations que ainda não foram aplicadas no banco, na ordem cronológica (por timestamp).

---

### Q: Como aplicar apenas uma migration específica?

**A:** Não é possível aplicar apenas uma. O TypeORM sempre aplica **todas** as pendentes em ordem. Se quiser aplicar apenas algumas:

1. Aplique todas: `migration:run:local`
2. Para parar em um ponto, mova temporariamente as migrations futuras para fora da pasta

---

### Q: Posso aplicar migrations fora de ordem?

**A:** ❌ NÃO! As migrations devem ser aplicadas na ordem cronológica (por timestamp no nome do arquivo).

---

### Q: E se eu quiser "pular" uma migration?

**A:** ❌ Não faça isso! Se uma migration não deve ser aplicada:

- **Opção 1:** Delete o arquivo antes de aplicar
- **Opção 2:** Aplique e depois reverta com `migration:revert`

---

### Q: Como saber quantas migrations serão aplicadas?

**A:** Use `migration:pending:local` antes de aplicar. Conte quantas têm `[ ]` (não executadas).

---

### Q: Posso cancelar durante a aplicação?

**A:** ⚠️ Não recomendado! Se pressionar Ctrl+C durante a aplicação, o banco pode ficar em estado inconsistente. Sempre deixe terminar.

---

### Q: O que acontece se uma migration falhar no meio?

**A:** O TypeORM usa transações. Se falhar, faz rollback automaticamente dessa migration (mas as anteriores já aplicadas permanecem).

---

## ⚠️ Avisos Importantes

### ✅ SEMPRE

1. ✅ Verificar migrations pendentes antes de aplicar
2. ✅ Revisar código das migrations
3. ✅ Fazer backup antes de produção
4. ✅ Testar em local/staging primeiro
5. ✅ Confirmar aplicação com `migration:show`

### ❌ NUNCA

1. ❌ Aplicar migrations em produção sem testar antes
2. ❌ Modificar migrations já aplicadas
3. ❌ Deletar migrations do repositório
4. ❌ Cancelar aplicação no meio (Ctrl+C)
5. ❌ Aplicar sem fazer backup em produção

---

## 🔗 Links Relacionados

- [Guia Completo de Migrations](./MIGRATIONS.md)
- [Workflow de Migrations](./MIGRATIONS-WORKFLOW.md)
- [README Principal](../README.md)

---

Desenvolvido com ❤️ para SuperPet API

