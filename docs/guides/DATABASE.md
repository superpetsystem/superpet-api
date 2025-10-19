# 🗄️ Database Guide

Complete guide for database schema, entities, and migrations.

---

## 📊 Database Schema Overview

### Entity Hierarchy

```
Organization (Tenant Root)
├── Users
│   └── Employees (roles: OWNER, ADMIN, STAFF, VIEWER)
│       └── Employee_Stores (N:M relationship)
├── Stores
│   ├── Store_Features (feature activation)
│   ├── Custom_Services (pricing overrides)
│   ├── Pickups (TelePickup feature)
│   └── Live_Cam_Streams
├── Customers
│   ├── Addresses
│   ├── Person_Data (PII protected)
│   └── Pets
└── Services (global catalog)
```

###Tables Summary

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `organizations` | Tenant root | Parent of all data |
| `users` | User accounts | → organizations |
| `employees` | Roles & permissions | → users, organizations |
| `employee_stores` | Store access | → employees, stores |
| `stores` | Store locations | → organizations |
| `store_features` | Feature toggles | → stores, features |
| `features` | Feature catalog | Global |
| `services` | Service catalog | Global |
| `custom_services` | Store pricing | → stores, services |
| `customers` | Customer profiles | → organizations |
| `addresses` | Customer addresses | → customers |
| `person_data` | PII data | → customers |
| `pets` | Pet profiles | → customers |
| `pickups` | TelePickup bookings | → stores, pets |
| `live_cam_streams` | Live streams | → stores, pets |
| `token_blacklist` | JWT blacklist | - |

**Total:** 16 tables | All with soft deletes (`deleted_at`)

---

## 🏗️ Entity Details

### Core Entities

#### Organizations (Tenant Root)

```typescript
@Entity('organizations')
export class OrganizationEntity {
  id: string;
  slug: string;              // Unique identifier
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  limits: {
    employees: number;       // Max employees
    stores: number;          // Max stores
    monthlyAppointments: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### Users

```typescript
@Entity('users')
export class UserEntity {
  id: string;
  organizationId: string;    // Multi-tenant key
  email: string;             // Unique per org
  name: string;
  password: string;          // Bcrypt hashed
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;    // Soft delete
}
```

**Unique constraint:** `(organization_id, email)`

#### Employees (RBAC)

```typescript
@Entity('employees')
export class EmployeeEntity {
  id: string;
  organizationId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER';
  jobTitle: 'OWNER' | 'MANAGER' | 'VETERINARIAN' | ... // 17 types
  active: boolean;
  workSchedule: object;      // JSON: { mon: [['08:00','18:00']] }
  
  // Relations
  employeeStores: EmployeeStoreEntity[];
}
```

**Role Hierarchy:** `OWNER > ADMIN > STAFF > VIEWER`

#### Stores

```typescript
@Entity('stores')
export class StoreEntity {
  id: string;
  organizationId: string;
  code: string;              // Unique per org
  name: string;
  timezone: string;
  openingHours: object;      // JSON: { mon: [['08:00','18:00']] }
  resourcesCatalog: string[];// ['GROOMER', 'VET']
  capacity: object;          // { GROOMER: 2 }
  blackoutDates: string[];   // ['2025-12-25']
}
```

### Business Entities

#### Customers

```typescript
@Entity('customers')
export class CustomerEntity {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;      // At least one contact required
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  source: 'WALK_IN' | 'WEBSITE' | 'PHONE' | 'REFERRAL';
  marketingConsent: object;  // { email, sms, whatsapp }
}
```

**Unique constraint:** `(organization_id, email)` when email not null

#### Pets

```typescript
@Entity('pets')
export class PetEntity {
  id: string;
  organizationId: string;
  customerId: string;
  name: string;
  species: 'DOG' | 'CAT' | 'BIRD' | 'REPTILE' | ...;
  breed: string | null;
  birthdate: Date | null;
  weightKg: number | null;   // Range: 0-200kg
  allergies: string[];       // JSON array
  microchip: string | null;  // Unique per org
  status: 'ACTIVE' | 'DECEASED';
}
```

**Business rule:** Cannot schedule services for DECEASED pets

---

## 🔄 Migrations System

### Migration Files

Located in `src/database/migrations/`:

| # | File | Description |
|---|------|-------------|
| 00 | `CreateOrganizationsTable` | Tenant root |
| 01 | `CreateUsersTable` | User accounts |
| 02 | `CreateStoresTable` | Store locations |
| 03 | `CreateEmployeesTable` | Roles & permissions |
| 04 | `CreateEmployeeStoresTable` | Store access (N:M) |
| 05 | `CreateCustomersTable` | Customer profiles |
| 06 | `CreatePersonalDataTable` | PII data |
| 07 | `CreateAddressesTable` | Customer addresses |
| 08 | `CreatePetsTable` | Pet profiles |
| 09 | `CreateServicesTable` | Service catalog |
| 10 | `CreateStoreFeaturesTable` | Feature toggles |
| 11 | `CreateCustomServicesTable` | Pricing overrides |
| 12 | `CreatePickupsTable` | TelePickup |
| 13 | `CreateLiveCamStreamsTable` | Live camera |
| 14 | `CreateTokenBlacklistTable` | JWT blacklist |
| 15 | `CreateFeaturesTable` | Feature catalog |

**All migrations:** ✅ Consolidated into single file per entity

### Migration Commands

```bash
# Show status
npm run migration:show:local

# Run pending
npm run migration:run:local

# Revert last
npm run migration:revert:local

# Create new (empty)
npm run migration:create src/database/migrations/AddColumnToTable

# Generate from entities
npm run migration:generate:local src/database/migrations/UpdateSchema
```

### Migration Structure

```typescript
export class CreateTableName1729000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'table_name',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'organization_id', type: 'varchar', length: '36' },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          {
            columnNames: ['organization_id'],
            referencedTableName: 'organizations',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
        indices: [
          { columnNames: ['organization_id'] },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('table_name');
  }
}
```

### Best Practices

✅ **DO:**
- Always provide both `up()` and `down()`
- Use transactions for complex migrations
- Add indexes for foreign keys
- Use meaningful migration names
- Test migrations before production

❌ **DON'T:**
- Modify existing migrations after deployed
- Delete migrations from version control
- Skip migrations in sequence
- Use `schema:sync` in production

---

## 🔐 Multi-Tenancy Strategy

### Isolation Rules

1. **All user data scoped by `organization_id`**
   - Automatic filtering in queries
   - Cross-tenant access returns 404 (not 403)

2. **Unique constraints per organization**
   - `(organization_id, email)` for users
   - `(organization_id, code)` for stores
   - `(organization_id, microchip)` for pets

3. **Foreign keys enforce data integrity**
   - `onDelete: 'RESTRICT'` for parent tables
   - `onDelete: 'CASCADE'` for dependent data
   - `onDelete: 'SET NULL'` for optional relations

4. **Soft deletes everywhere**
   - `deleted_at` column on all tables
   - Allows data recovery
   - Maintains referential integrity

### Query Patterns

```typescript
// ✅ Good: Scoped by organization
await this.repository.find({
  where: { organizationId, deletedAt: IsNull() }
});

// ❌ Bad: No organization scope
await this.repository.find({
  where: { id }
});

// ✅ Good: Validate ownership
const entity = await this.repository.findOne({ where: { id }});
if (entity.organizationId !== user.organizationId) {
  throw new NotFoundException(); // 404, not 403!
}
```

---

## 📈 Indexes Strategy

### Performance Indexes

```sql
-- Primary keys (automatic)
PRIMARY KEY (id)

-- Multi-tenant queries
INDEX idx_org_id ON users (organization_id)
INDEX idx_org_email ON users (organization_id, email)

-- Foreign keys
INDEX idx_customer_id ON pets (customer_id)
INDEX idx_store_id ON employees (store_id)

-- Soft deletes
INDEX idx_deleted_at ON users (deleted_at)

-- Composite for common queries
INDEX idx_org_status ON customers (organization_id, status, deleted_at)
```

### Index Guidelines

- Index all foreign keys
- Index `organization_id` on every tenant table
- Add composite indexes for frequent WHERE clauses
- Include `deleted_at` in filtered indexes
- Monitor slow queries and add indexes as needed

---

## 🛠️ TypeORM Configuration

### Data Source Setup

```typescript
// src/database/data-source.ts
export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,  // ⚠️ Never true in production!
  logging: process.env.NODE_ENV === 'local',
  timezone: 'Z',       // UTC
  charset: 'utf8mb4',
  poolSize: 10,
});
```

### Entity Base Class

```typescript
// src/common/entities/base.entity.ts
export abstract class BaseEntity {
  @PrimaryColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @BeforeInsert()
  generateId() {
    this.id = this.id || uuidv4();
  }
}
```

**All entities extend BaseEntity** ✅

---

## ✅ Migration Checklist

Before deploying migrations:

- [ ] Tested locally with `migration:run:local`
- [ ] Tested rollback with `migration:revert:local`
- [ ] Both `up()` and `down()` implemented
- [ ] Foreign keys defined correctly
- [ ] Indexes added for performance
- [ ] Soft delete column included
- [ ] Organization scoping maintained
- [ ] Backup database taken
- [ ] Tested on staging environment

---

## 📚 Related Documentation

- [SETUP.md](./SETUP.md) - Environment and scripts
- [API.md](./API.md) - API endpoints reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [ERRORS.md](./ERRORS.md) - Error handling

---

**✨ Database schema is production-ready!**

