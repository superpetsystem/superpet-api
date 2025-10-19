# 🏗️ System Architecture

Enterprise-grade multi-tenant SaaS platform for pet care businesses.

---

## 🎯 Overview

**SuperPet API** is a **NestJS-based REST API** with:
- **Multi-tenant SaaS** architecture (organization isolation)
- **Role-based access control** (RBAC) with 5 roles
- **Dynamic feature system** (database-driven)
- **Multi-store management** per organization
- **Complete pet care workflows**

---

## 📊 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | NestJS 11.x | TypeScript backend framework |
| **Database** | MySQL 8.x | Relational database |
| **ORM** | TypeORM 0.3.x | Database migrations & queries |
| **Auth** | JWT + Bcrypt | Authentication & authorization |
| **Validation** | class-validator | DTO validation |
| **Testing** | Jest + Axios | Unit & automation tests |

---

## 🏢 Multi-Tenant Architecture

### Organization Hierarchy

```
Organization (Tenant Root)
├── Users
│   └── Employees (RBAC: OWNER/ADMIN/STAFF/VIEWER)
│       └── Employee_Stores (N:M)
├── Stores
│   ├── Store_Features
│   ├── Custom_Services
│   ├── Pickups
│   └── Live_Cam_Streams
├── Customers
│   ├── Addresses
│   ├── Person_Data (PII)
│   └── Pets
└── Services (Global Catalog)
```

### Isolation Strategy

**All data scoped by `organizationId`:**
- Automatic filtering in queries
- Unique constraints per org: `(organizationId, email)`, `(organizationId, code)`
- Cross-tenant access returns `404` (not `403`)
- Foreign keys enforce integrity

**Example Query:**
```typescript
// ✅ Correct
await repository.find({
  where: { organizationId, deletedAt: IsNull() }
});

// ❌ Wrong (no tenant scope)
await repository.find({ where: { id }});
```

---

## 🔐 Security Layers

### 1. Authentication (JWT)

```typescript
// JWT Payload
{
  sub: userId,
  email: user.email,
  organizationId: user.organizationId,
  employee: {
    id: employeeId,
    role: 'OWNER',
    active: true
  }
}
```

**Token Lifecycle:**
- Expiration: 15 minutes
- Storage: Bearer token in `Authorization` header
- Refresh: Not implemented (re-login required)

### 2. Authorization (RBAC)

**Role Hierarchy:**
```
SUPER_ADMIN (Database-only, cross-tenant)
    ↓
OWNER (Organization owner, full access)
    ↓
ADMIN (Store manager, creates STAFF/VIEWER)
    ↓
STAFF (Store operations, limited access)
    ↓
VIEWER (Read-only)
```

**Permission Rules:**
- `OWNER` creates: OWNER, ADMIN, STAFF, VIEWER
- `ADMIN` creates: STAFF, VIEWER
- `STAFF/VIEWER` cannot create employees
- `STAFF/VIEWER` access only assigned stores

### 3. Guards

```typescript
@UseGuards(JwtAuthGuard, RoleGuard, StoreAccessGuard)
```

| Guard | Purpose |
|-------|---------|
| `JwtAuthGuard` | Validates JWT token |
| `RoleGuard` | Checks employee role |
| `StoreAccessGuard` | Validates store access |
| `FeatureGuard` | Checks feature entitlement |
| `TenantGuard` | Validates organizationId |

---

## ⚡ Dynamic Feature System

Features are **database-driven** (no code changes to add new features).

### Feature Entity

```typescript
@Entity('features')
export class FeatureEntity {
  key: string;              // TELEPICKUP, LIVE_CAM
  name: string;             // "TelePickup"
  category: string;         // SERVICES, CUSTOMER, OPERATIONS
  minPlanRequired: string;  // FREE, BASIC, PRO
  defaultEnabled: boolean;
}
```

### Store Features (Per-Store Activation)

```typescript
@Entity('store_features')
export class StoreFeaturesEntity {
  storeId: string;
  featureKey: string;
  enabled: boolean;
  customLimit: number | null;  // Override default limit
}
```

### Usage

```typescript
// Enable feature for store
PUT /v1/stores/:storeId/features/TELEPICKUP
{
  "enabled": true,
  "customLimit": 50
}

// Feature guard
@UseGuards(FeatureGuard('TELEPICKUP'))
```

**Scalability:** System ready for 20+ features without code changes ✅

---

## 💼 Business Logic Layers

### Module Structure

```
src/
├── auth/              # JWT authentication
├── organizations/     # Multi-tenant root
├── users/             # User accounts
├── employees/         # RBAC & roles
├── stores/            # Store management
├── customers/         # Customer CRM
├── pets/              # Pet profiles
├── services/          # Service catalog
├── pickups/           # TelePickup feature
├── live-cam/          # Live camera feature
├── common/
│   ├── guards/        # Security guards
│   ├── decorators/    # Custom decorators
│   └── entities/      # Base entity
└── database/
    ├── migrations/    # TypeORM migrations
    └── seeds/         # Database seeders
```

### Layer Responsibilities

```
Controller → Service → Repository → Entity
     ↓          ↓          ↓           ↓
  HTTP      Business    Data       Database
  Layer      Logic     Access      Schema
```

**Example:**
```typescript
// Controller: HTTP handling
@Post()
async create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}

// Service: Business logic
async create(dto: CreateDto) {
  await this.validate(dto);
  return this.repository.save(dto);
}

// Repository: Data access
async save(data) {
  return this.orm.save(data);
}
```

---

## 📦 SaaS Plan Limits

Plans enforce resource limits:

| Plan | Stores | Employees | Appointments/mo | Features |
|------|--------|-----------|-----------------|----------|
| **FREE** | 1 | 5 | 100 | Basic |
| **BASIC** | 3 | 20 | 1,000 | Standard |
| **PRO** | 10 | 50 | 5,000 | Advanced |
| **ENTERPRISE** | ∞ | ∞ | ∞ | All |

### Limit Enforcement

```typescript
// Before creating store
await planLimitsService.validateStoreCreation(organizationId);
// Throws: STORE_LIMIT_EXCEEDED if limit reached

// Before creating employee
await planLimitsService.validateEmployeeCreation(organizationId);
// Throws: EMPLOYEE_LIMIT_EXCEEDED if limit reached
```

**Logging:**
```log
✅ [PLAN LIMITS] Store creation allowed - 2/10 - OrgID: uuid
❌ [PLAN LIMITS] STORE_LIMIT_EXCEEDED - Plan: BASIC, Max: 3, Current: 3
```

---

## 🔄 Data Flow Examples

### 1. Create Customer

```
Client → POST /v1/customers
    ↓
CustomersController.create()
    ├─→ Logger: "📝 Create customer - Email: user@test.com"
    ↓
CustomerService.create()
    ├─→ Validate: At least one contact (email/phone)
    ├─→ Check: Email unique in organization
    ├─→ Logger: "✅ [BUSINESS RULE] Validation passed"
    ↓
CustomersRepository.create()
    ├─→ Set organizationId
    ├─→ Generate UUID
    ├─→ Save to database
    ↓
Response: CustomerEntity
```

### 2. Employee Creates Another Employee

```
Client → POST /v1/employees (Bearer token)
    ↓
JwtAuthGuard
    ├─→ Validate JWT token
    ├─→ Extract user + employee
    ↓
RoleGuard
    ├─→ Check: User has employee record
    ├─→ Validate: Role hierarchy (OWNER > ADMIN > STAFF)
    ├─→ Logger: "✅ [ROLE HIERARCHY] OWNER can create ADMIN"
    ↓
EmployeeService.create()
    ├─→ PlanLimitsService.validateEmployeeCreation()
    ├─→ Check: Email unique
    ├─→ Hash password
    ├─→ Create User + Employee
    ↓
Response: EmployeeEntity
```

### 3. STAFF Access Store

```
Client → GET /v1/stores/:storeId (Bearer token)
    ↓
JwtAuthGuard → Validate token
    ↓
StoreAccessGuard
    ├─→ Check: Employee role
    ├─→ If OWNER/ADMIN: ✅ Allow (full access)
    ├─→ If STAFF/VIEWER:
    │      └─→ Check employee_stores table
    │      └─→ If linked: ✅ Allow
    │      └─→ Else: ❌ 403 STORE_ACCESS_DENIED
    ↓
StoresController.findOne()
    ├─→ Validate: storeId belongs to user's organization
    ├─→ If cross-tenant: ❌ 404 (not 403!)
    ↓
Response: StoreEntity
```

---

## 🗄️ Database Design

### Key Patterns

**1. Soft Deletes**
- All tables have `deleted_at` column
- Queries filter by `deleted_at IS NULL`
- Preserves data for recovery/audit

**2. UUIDs**
- All primary keys are UUID v4
- Generated in `@BeforeInsert()` hook
- Cross-database compatible

**3. Timestamps**
- `created_at` - Auto-set on insert
- `updated_at` - Auto-updated on change
- `deleted_at` - Set on soft delete

**4. JSON Columns**
- `organization.limits` - Plan limits
- `store.openingHours` - Schedule
- `customer.marketingConsent` - Consent tracking

### Indexes Strategy

```sql
-- Multi-tenant queries
INDEX (organization_id, email)
INDEX (organization_id, status, deleted_at)

-- Foreign keys
INDEX (customer_id)
INDEX (store_id)

-- Common filters
INDEX (organization_id, active)
INDEX (organization_id, created_at)
```

---

## 🧪 Testing Strategy

### Test Pyramid

```
      /\
     /  \      E2E Tests (app.e2e-spec.ts)
    /    \
   /──────\    Integration Tests (automation/)
  /        \
 /  Unit    \  Unit Tests (*.spec.ts)
/____________\
```

### Automation Tests (88 tests)

| Module | Tests | Coverage |
|--------|-------|----------|
| Auth | 6 | Login, register, profile |
| Stores | 7 | CRUD, features |
| Customers | 8 | CRUD, addresses, PII |
| Pets | 6 | CRUD, validation |
| Services | 7 | Catalog, custom pricing |
| Features | 7 | TelePickup, Live Cam |
| SaaS Isolation | 13 | Cross-tenant prevention |
| Plan Limits | 4 | Resource limits |
| Employees | 10 | Role hierarchy |
| Feature Scalability | 6 | Dynamic features |
| Validation Errors | 12 | Input validation |
| Permission Errors | 2 | Authorization |

**Run:** `node test/automation/run-all-tests.js`

---

## 🚀 Deployment Architecture

### Environments

```
Development → Staging → Production
    ↓           ↓          ↓
 Local DB    Test DB    Prod DB
```

**Each environment has:**
- Separate database
- Unique JWT secrets
- Environment-specific configs in `env/`

### Production Checklist

- [ ] Environment variables configured
- [ ] JWT secrets generated (strong)
- [ ] Database migrations applied
- [ ] Database seeded (if needed)
- [ ] SSL/TLS enabled
- [ ] Rate limiting configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] CI/CD pipeline configured

---

## 📈 Performance Considerations

### Query Optimization

```typescript
// ✅ Good: Specific relations
repository.find({
  relations: ['customer', 'addresses'],
  where: { organizationId, deletedAt: IsNull() }
});

// ❌ Bad: Loads everything
repository.find({ relations: [] });
```

### Indexing

- Index all foreign keys
- Composite indexes for multi-column queries
- Include `deleted_at` in filtered indexes

### Caching Strategy (Future)

```typescript
// Cache key pattern
const cacheKey = `${organizationId}:${resourceType}:${id}`;

// Invalidate on update
await cache.del(`${organizationId}:customers:${customerId}`);
```

---

## 🔮 Future Enhancements

### Planned

- [ ] **Appointments** - Scheduling system
- [ ] **Payments** - Payment processing
- [ ] **Notifications** - Real-time (WebSocket)
- [ ] **Reports** - Analytics dashboard
- [ ] **Mobile API** - Mobile-specific endpoints
- [ ] **Rate Limiting** - Per-tenant limits
- [ ] **API Versioning** - `/v2` support

### Infrastructure

- [ ] Docker containers
- [ ] CI/CD pipeline
- [ ] Monitoring (Datadog/NewRelic)
- [ ] Load balancing
- [ ] Database replication
- [ ] Redis caching

---

## 📚 Related Documentation

- [SETUP.md](./SETUP.md) - Environment and scripts
- [DATABASE.md](./DATABASE.md) - Database schema
- [API.md](./API.md) - API endpoints
- [ERRORS.md](./ERRORS.md) - Error handling

---

**✨ Production-ready enterprise SaaS architecture!**
