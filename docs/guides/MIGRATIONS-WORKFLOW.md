# 🔄 Fluxo de Trabalho com Migrations - SuperPet API

Este documento explica o fluxo completo de trabalho com migrations do TypeORM, desde criar uma entity até aplicar mudanças no banco de dados.

---

## 📚 Índice

1. [O que são Migrations?](#o-que-são-migrations)
2. [Fluxo Básico](#fluxo-básico)
3. [Cenários Comuns](#cenários-comuns)
4. [Comandos Disponíveis](#comandos-disponíveis)
5. [Boas Práticas](#boas-práticas)
6. [Troubleshooting](#troubleshooting)
7. [Exemplos Práticos](#exemplos-práticos)

---

## O que são Migrations?

Migrations são arquivos de código que **descrevem mudanças no schema do banco de dados** de forma versionada e reversível.

### Por que usar Migrations?

✅ **Versionamento**: Histórico de todas as mudanças no banco  
✅ **Reversível**: Pode desfazer mudanças (`down`)  
✅ **Repetível**: Mesmas mudanças em dev, staging e prod  
✅ **Seguro**: Evita usar `synchronize: true` em produção  
✅ **Colaborativo**: Time inteiro usa as mesmas mudanças  

---

## Fluxo Básico

### 📋 Passo a Passo:

```
1. Modificar Entity
      ↓
2. Gerar Migration
      ↓
3. Revisar Migration
      ↓
4. Aplicar Migration
      ↓
5. Testar
      ↓
6. Commit (código + migration)
```

---

## Cenários Comuns

### 1️⃣ Criar Nova Entity

#### Passo 1: Criar a Entity

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

  @Column({ type: 'date' })
  birthDate: Date;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
```

#### Passo 2: Gerar Migration

```bash
# Local
npm run migration:generate:local src/database/migrations/CreatePetsTable

# Staging (se necessário)
npm run migration:generate:staging src/database/migrations/CreatePetsTable

# Production (se necessário)
npm run migration:generate:production src/database/migrations/CreatePetsTable
```

#### Passo 3: Revisar Migration Gerada

O TypeORM gera automaticamente:

```typescript
// src/database/migrations/1729000000001-CreatePetsTable.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePetsTable1729000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pets',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'species',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'breed',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'birthDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'pets',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key primeiro
    const table = await queryRunner.getTable('pets');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    await queryRunner.dropForeignKey('pets', foreignKey);

    // Depois remove a tabela
    await queryRunner.dropTable('pets');
  }
}
```

#### Passo 4: Aplicar Migration

```bash
npm run migration:run:local
```

#### Passo 5: Verificar

```bash
npm run migration:show:local
```

**Output:**
```
[X] CreateUsersTable1729000000000
[X] CreatePetsTable1729000000001
```

---

### 2️⃣ Adicionar Campo a Entity Existente

#### Passo 1: Adicionar campo na Entity

```typescript
// src/users/entities/user.entity.ts
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  // ✨ NOVO CAMPO
  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  refreshToken: string | null;
}
```

#### Passo 2: Gerar Migration

```bash
npm run migration:generate:local src/database/migrations/AddPhoneToUsers
```

**Migration gerada:**
```typescript
export class AddPhoneToUsers1729000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
  }
}
```

#### Passo 3: Aplicar

```bash
npm run migration:run:local
```

---

### 3️⃣ Modificar Campo Existente

#### Passo 1: Modificar na Entity

```typescript
// Antes
@Column()
name: string;

// Depois (aumentar tamanho)
@Column({ length: 500 })
name: string;
```

#### Passo 2: Gerar Migration

```bash
npm run migration:generate:local src/database/migrations/IncreaseUserNameLength
```

#### Passo 3: Aplicar

```bash
npm run migration:run:local
```

---

### 4️⃣ Remover Campo

#### Passo 1: Remover da Entity

```typescript
// src/users/entities/user.entity.ts
@Entity('users')
export class UserEntity extends BaseEntity {
  // ... outros campos

  // ❌ REMOVER ESTE CAMPO
  // @Column({ nullable: true })
  // oldField: string;
}
```

#### Passo 2: Gerar Migration

```bash
npm run migration:generate:local src/database/migrations/RemoveOldFieldFromUsers
```

**Migration gerada:**
```typescript
export class RemoveOldFieldFromUsers1729000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'oldField');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'oldField',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }
}
```

---

### 5️⃣ Adicionar Índice

#### Migration Manual

```typescript
export class AddIndexToUserEmail1729000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_EMAIL',
        columnNames: ['email'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_USER_EMAIL');
  }
}
```

---

## Comandos Disponíveis

### 📝 Criar Migration Vazia (Manual)

```bash
npm run migration:create src/database/migrations/CustomMigration
```

Cria arquivo vazio para você escrever manualmente.

---

### 🤖 Gerar Migration Automática (Recomendado)

Detecta diferenças entre entities e banco de dados:

```bash
# Local
npm run migration:generate:local src/database/migrations/NomeDaMigration

# Staging
npm run migration:generate:staging src/database/migrations/NomeDaMigration

# Production
npm run migration:generate:production src/database/migrations/NomeDaMigration
```

---

### ▶️ Aplicar Migrations

Executa todas as migrations pendentes:

```bash
# Local
npm run migration:run:local

# Staging
npm run migration:run:staging

# Production
npm run migration:run:production
```

---

### ↩️ Reverter Migration

Desfaz a **última** migration executada:

```bash
# Local
npm run migration:revert:local

# Staging
npm run migration:revert:staging

# Production
npm run migration:revert:production
```

⚠️ **CUIDADO**: Em produção, sempre faça backup antes de reverter!

---

### 👁️ Ver Status

Mostra quais migrations foram aplicadas:

```bash
# Local
npm run migration:show:local

# Staging
npm run migration:show:staging

# Production
npm run migration:show:production
```

**Output exemplo:**
```
[X] CreateUsersTable1729000000000
[X] CreatePetsTable1729000000001
[ ] AddPhoneToUsers1729000000002
```

- `[X]` = Executada
- `[ ]` = Pendente

---

## Boas Práticas

### ✅ SEMPRE FAÇA

1. **Revise migrations geradas**
   - TypeORM pode não detectar tudo perfeitamente
   - Verifique tipos, tamanhos, constraints

2. **Teste localmente primeiro**
   ```bash
   npm run migration:run:local
   # Testar aplicação
   npm run migration:revert:local  # Se necessário
   ```

3. **Use nomes descritivos**
   ```bash
   ✅ AddPhoneToUsers
   ✅ CreatePetsTable
   ✅ AddIndexToUserEmail
   ❌ Update1
   ❌ Fix
   ❌ Changes
   ```

4. **Implemente o método `down()`**
   - Sempre permita reverter
   - Essencial para rollback em produção

5. **Faça backup antes de produção**
   ```bash
   mysqldump -u root -p superpet_prod_db > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

6. **Commite migrations com código**
   ```bash
   git add src/database/migrations/
   git add src/users/entities/user.entity.ts
   git commit -m "feat: add phone field to users"
   ```

7. **Uma migration por mudança lógica**
   - ✅ Uma migration para adicionar tabela Pets
   - ✅ Outra migration para adicionar campo phone em Users
   - ❌ Não misture mudanças não relacionadas

---

### ❌ NUNCA FAÇA

1. **Modificar migrations já aplicadas em produção**
   - Crie uma nova migration para corrigir
   - Não edite migrations antigas

2. **Deletar migrations do repositório**
   - Mesmo antigas, mantenha o histórico

3. **Usar `synchronize: true` em produção**
   - Pode causar perda de dados
   - Sempre use migrations

4. **Aplicar migrations sem testar**
   - Sempre teste em local/staging primeiro

5. **Ignorar o método `down()`**
   - Sempre implemente para permitir rollback

---

## Troubleshooting

### ❗ Problema: "No changes in database schema were found"

**Causa**: Nenhuma diferença detectada entre entities e banco.

**Soluções**:
1. Verifique se salvou as mudanças na entity
2. Verifique se está conectando no banco correto
3. Use migration manual se necessário

---

### ❗ Problema: Migration falhou no meio

**Solução**:
```bash
# 1. Reverter
npm run migration:revert:local

# 2. Corrigir migration ou entity

# 3. Aplicar novamente
npm run migration:run:local
```

---

### ❗ Problema: Banco e código fora de sincronia

**Solução**:
```bash
# Ver quais migrations estão pendentes
npm run migration:show:local

# Aplicar todas pendentes
npm run migration:run:local
```

---

### ❗ Problema: Migration já aplicada mas arquivo foi modificado

**Causa**: Modificou arquivo de migration já executado.

**Solução**:
1. **Reverter a mudança no arquivo**
2. **Criar nova migration** para a correção

```bash
# NUNCA faça:
# Editar: 1729000000001-CreatePetsTable.ts (já aplicada)

# ✅ FAÇA:
# Criar nova: 1729000000005-FixPetsTable.ts
```

---

## Exemplos Práticos

### Exemplo Completo: Adicionar Módulo de Pets

#### 1. Criar Entity

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

  @Column({ type: 'date' })
  birthDate: Date;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
```

#### 2. Gerar Migration

```bash
npm run migration:generate:local src/database/migrations/CreatePetsTable
```

#### 3. Revisar e Ajustar Migration

```typescript
// Adicionar índice no userId
await queryRunner.createIndex(
  'pets',
  new TableIndex({
    name: 'IDX_PET_USER_ID',
    columnNames: ['userId'],
  }),
);
```

#### 4. Aplicar

```bash
npm run migration:run:local
```

#### 5. Verificar

```bash
npm run migration:show:local
```

#### 6. Testar Aplicação

```bash
npm run start:local
# Testar CRUD de pets
```

#### 7. Commit

```bash
git add src/pets/
git add src/database/migrations/
git commit -m "feat: add pets module with database table"
git push
```

---

## 📊 Workflow Completo para Deploy

### Local → Staging → Production

```bash
# === LOCAL ===
# 1. Desenvolver
# 2. Criar/modificar entities
# 3. Gerar migration
npm run migration:generate:local src/database/migrations/AddFeature

# 4. Aplicar e testar
npm run migration:run:local
npm run start:local
# Testar...

# 5. Commit
git add .
git commit -m "feat: add new feature"
git push origin develop

# === STAGING ===
# No servidor de staging
git pull origin develop
npm install
npm run build

# Aplicar migrations
npm run migration:show:staging  # Ver pendentes
npm run migration:run:staging   # Aplicar

# Iniciar app
npm run start:staging

# Testar...

# === PRODUCTION ===
# Merge para main
git checkout main
git merge develop
git push origin main

# No servidor de produção
# 1. BACKUP!
mysqldump -u root -p superpet_prod_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull do código
git pull origin main
npm install --production
npm run build

# 3. Ver migrations pendentes
npm run migration:show:production

# 4. Aplicar migrations
npm run migration:run:production

# 5. Reiniciar aplicação
pm2 restart superpet-api-production

# 6. Verificar logs
pm2 logs superpet-api-production
```

---

## 🔗 Links Úteis

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [TypeORM Migration API](https://typeorm.io/migrations#migration-api)
- [Guia de Ambientes](./ENVIRONMENTS.md)
- [Guia de Scripts](./SCRIPTS.md)

---

## 📞 Precisa de Ajuda?

1. Verifique o [Troubleshooting](#troubleshooting)
2. Consulte a [documentação do TypeORM](https://typeorm.io/migrations)
3. Revise os logs de erro cuidadosamente
4. Faça backup antes de operações arriscadas

---

Desenvolvido com ❤️ para SuperPet API

