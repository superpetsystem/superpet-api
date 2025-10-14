# 📦 Guia de Migrations - SuperPet API

Este guia explica como gerenciar migrations do banco de dados em diferentes ambientes.

## 🎯 Comandos Disponíveis

### 1. Criar uma Migration (Vazia)

Cria uma migration em branco para você escrever manualmente:

```bash
npm run migration:create src/database/migrations/NomeDaMigration
```

**Exemplo:**
```bash
npm run migration:create src/database/migrations/CreatePetsTable
```

---

### 2. Gerar Migration Automaticamente

Gera uma migration baseada nas diferenças entre suas entities e o banco de dados atual.

#### Local (Desenvolvimento)
```bash
npm run migration:generate:local src/database/migrations/NomeDaMigration
```

#### Staging
```bash
npm run migration:generate:staging src/database/migrations/NomeDaMigration
```

#### Production
```bash
npm run migration:generate:production src/database/migrations/NomeDaMigration
```

**Exemplo:**
```bash
npm run migration:generate:local src/database/migrations/AddPhoneToUser
```

---

### 3. Executar Migrations

Aplica **TODAS** as migrations pendentes no banco de dados de uma só vez.

#### Local (Desenvolvimento)
```bash
# Método 1 (padrão)
npm run migration:run:local

# Método 2 (alias explícito)
npm run migration:apply:all:local
```

#### Staging
```bash
# Método 1 (padrão)
npm run migration:run:staging

# Método 2 (alias explícito)
npm run migration:apply:all:staging
```

#### Production
```bash
# Método 1 (padrão)
npm run migration:run:production

# Método 2 (alias explícito)
npm run migration:apply:all:production
```

⚠️ **IMPORTANTE:** Estes comandos aplicam **TODAS** as migrations pendentes automaticamente. Sempre verifique quais migrations serão aplicadas antes usando `migration:show` ou `migration:pending`!

---

### 4. Reverter Migration

Desfaz a última migration executada.

#### Local (Desenvolvimento)
```bash
npm run migration:revert:local
```

#### Staging
```bash
npm run migration:revert:staging
```

#### Production
```bash
npm run migration:revert:production
```

---

### 5. Visualizar Status das Migrations

Mostra quais migrations foram executadas e quais estão pendentes.

#### Local (Desenvolvimento)
```bash
# Método 1 (padrão)
npm run migration:show:local

# Método 2 (alias mais descritivo)
npm run migration:pending:local
```

#### Staging
```bash
# Método 1 (padrão)
npm run migration:show:staging

# Método 2 (alias mais descritivo)
npm run migration:pending:staging
```

#### Production
```bash
# Método 1 (padrão)
npm run migration:show:production

# Método 2 (alias mais descritivo)
npm run migration:pending:production
```

---

## 🔄 Fluxo de Trabalho Recomendado

### 1. Desenvolvimento Local

```bash
# 1. Criar/modificar sua entity
# Exemplo: adicionar campo `phone` em UserEntity

# 2. Gerar migration automaticamente
npm run migration:generate:local src/database/migrations/AddPhoneToUser

# 3. Revisar a migration gerada em src/database/migrations/

# 4. Verificar migrations pendentes (IMPORTANTE!)
npm run migration:pending:local
# ou
npm run migration:show:local

# 5. Aplicar TODAS as migrations pendentes
npm run migration:apply:all:local
# ou
npm run migration:run:local

# 6. Verificar se foi aplicada
npm run migration:show:local
```

### 2. Deploy para Staging

```bash
# 1. Fazer push do código com as migrations

# 2. No servidor de staging
npm run build

# 3. Verificar migrations pendentes
npm run migration:pending:staging

# 4. Aplicar TODAS as migrations
npm run migration:apply:all:staging

# 5. Verificar se foram aplicadas
npm run migration:show:staging

# 6. Iniciar aplicação
npm run start:staging
```

### 3. Deploy para Production

```bash
# 1. Fazer merge/push para branch de produção

# 2. No servidor de produção - FAZER BACKUP!
mysqldump -u root -p superpet_prod_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Pull do código
git pull origin main
npm install --production
npm run build

# 4. Verificar migrations pendentes (CRÍTICO!)
npm run migration:pending:production

# 5. Revisar cada migration que será aplicada
# Ler os arquivos em src/database/migrations/

# 6. Aplicar TODAS as migrations
npm run migration:apply:all:production

# 7. Verificar se foram aplicadas
npm run migration:show:production

# 8. Iniciar aplicação
npm run start:prod
```

---

## ⚠️ Boas Práticas

### ✅ FAÇA

1. **Sempre revise migrations geradas automaticamente** antes de commitar
2. **Teste migrations localmente** antes de aplicar em staging/production
3. **Faça backup do banco** antes de rodar migrations em produção
4. **Use nomes descritivos** para suas migrations
5. **Implemente o método `down()`** para poder reverter se necessário
6. **Commite as migrations** junto com as mudanças de código

### ❌ NÃO FAÇA

1. **Não modifique migrations** que já foram executadas em produção
2. **Não delete migrations** antigas do repositório
3. **Não execute migrations em produção** sem testar antes
4. **Não use `synchronize: true`** em produção
5. **Não execute `schema:drop`** em produção

---

## 🗂️ Estrutura das Migrations

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateExampleTable1234567890123 implements MigrationInterface {
  // Método executado ao aplicar a migration
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'example',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
        ],
      }),
    );
  }

  // Método executado ao reverter a migration
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('example');
  }
}
```

---

## 🔍 Troubleshooting

### Problema: "No connection options were found"

**Solução:** Verifique se o arquivo `.env.local`, `.env.staging` ou `.env.production` existe e está configurado corretamente.

### Problema: "Cannot find module"

**Solução:** Execute `npm install` para garantir que todas as dependências estão instaladas.

### Problema: Migration já foi executada mas aparece como pendente

**Solução:** Verifique a tabela `migrations` no banco de dados e compare com os arquivos em `src/database/migrations/`.

### Problema: Erro de conexão com o banco

**Solução:** 
1. Verifique as credenciais no arquivo `.env.*`
2. Confirme que o MySQL está rodando
3. Verifique se o database existe: `CREATE DATABASE superpet_db;`

---

## 📝 Exemplo Completo: Adicionar Tabela de Pets

### 1. Criar a Entity

```typescript
// src/pets/entities/pet.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('pets')
export class PetEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  species: string;

  @Column()
  breed: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
```

### 2. Gerar Migration

```bash
npm run migration:generate:local src/database/migrations/CreatePetsTable
```

### 3. Aplicar Migration

```bash
npm run migration:run:local
```

### 4. Verificar

```bash
npm run migration:show:local
```

Você verá algo como:
```
[X] CreateUsersTable1729000000000
[X] CreatePetsTable1729000000001
```

---

## 🚀 Scripts Resumidos

| Comando | Descrição |
|---------|-----------|
| `npm run migration:create` | Cria migration vazia |
| `npm run migration:generate:local` | Gera migration do banco local |
| `npm run migration:generate:staging` | Gera migration do banco staging |
| `npm run migration:generate:production` | Gera migration do banco produção |
| `npm run migration:run:local` | Aplica migrations no local |
| `npm run migration:run:staging` | Aplica migrations no staging |
| `npm run migration:run:production` | Aplica migrations na produção |
| `npm run migration:revert:local` | Reverte última migration (local) |
| `npm run migration:revert:staging` | Reverte última migration (staging) |
| `npm run migration:revert:production` | Reverte última migration (produção) |
| `npm run migration:show:local` | Lista status das migrations (local) |
| `npm run migration:show:staging` | Lista status das migrations (staging) |
| `npm run migration:show:production` | Lista status das migrations (produção) |

---

## 📚 Recursos Adicionais

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [TypeORM QueryRunner API](https://typeorm.io/query-runner)
- [MySQL Data Types](https://dev.mysql.com/doc/refman/8.0/en/data-types.html)

---

Desenvolvido com ❤️ para SuperPet API

