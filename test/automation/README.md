# 🧪 Automation Tests

Complete test suite with 88 automated tests covering all modules.

---

## 🚀 Quick Start

```bash
# Terminal 1: Start API
npm run start:local

# Terminal 2: Run all tests
node test/automation/run-all-tests.js
```

**Expected:** ✅ All 88 tests pass in ~10 seconds

---

## 📊 Test Modules

| Module | Tests | File | Coverage |
|--------|-------|------|----------|
| **Auth** | 6 | `auth/auth.test.js` | Register, login, profile, errors |
| **Stores** | 7 | `stores/stores.test.js` | CRUD, features, validation |
| **Customers** | 8 | `customers/customers.test.js` | CRUD, addresses, PII, status |
| **Pets** | 6 | `pets/pets.test.js` | CRUD, validation, status, weight |
| **Services** | 7 | `services/services.test.js` | Catalog, custom pricing, states |
| **Features** | 7 | `features/features.test.js` | TelePickup, Live Cam |
| **SaaS Isolation** | 13 | `saas/saas-isolation.test.js` | Cross-tenant prevention |
| **SaaS Limits** | 4 | `saas/saas-limits.test.js` | Plan limits enforcement |
| **Employees** | 10 | `employees/employees-hierarchy.test.js` | Role hierarchy |
| **Features Scale** | 6 | `features/features-scalability.test.js` | Dynamic features |
| **Validation Errors** | 12 | `errors/validation-errors.test.js` | Input validation |
| **Permission Errors** | 2 | `errors/permission-errors.test.js` | Authorization |
| **TOTAL** | **88** | **12 files** | **Complete** |

---

## 🔬 Test Details

### Auth (6 tests)

**File:** `auth/auth.test.js`

```javascript
✅ Register new user
✅ Login with credentials
✅ Get user profile (JWT)
❌ Login with wrong password → 401
❌ Register duplicate email → 400
❌ Access without token → 401
```

**Validates:**
- JWT token generation
- Password hashing (bcrypt)
- Email uniqueness per org
- Unauthorized access handling

---

### Stores (7 tests)

**File:** `stores/stores.test.js`

```javascript
✅ List stores
✅ Get store by ID
✅ Create store
✅ Update store
✅ Get store features
✅ Configure feature (TELEPICKUP)
❌ Create with duplicate code → 400
```

**Validates:**
- Multi-store management
- Feature configuration
- Code uniqueness per org

---

### Customers (8 tests)

**File:** `customers/customers.test.js`

```javascript
✅ Create customer
✅ List customers
✅ Get by ID
✅ Add address
✅ List addresses
✅ Update status (ACTIVE/INACTIVE)
✅ Add personal data (PII)
❌ Create without contact → 400 MISSING_CONTACT
```

**Validates:**
- Customer CRUD
- Address management
- PII protection (OWNER/ADMIN only)
- Business rule: At least one contact (email/phone)

---

### Pets (6 tests)

**File:** `pets/pets.test.js`

```javascript
✅ Create pet
✅ List customer pets
✅ Get by ID
✅ Update pet
✅ Update status (DECEASED)
❌ Create with invalid weight → 400 INVALID_WEIGHT
```

**Validates:**
- Multi-species support (DOG, CAT, BIRD, etc)
- Weight validation (0-200kg)
- Status management
- Microchip uniqueness

---

### Services (7 tests)

**File:** `services/services.test.js`

```javascript
✅ List services
✅ Create service
✅ Create custom service (store override)
✅ Publish custom service
✅ List store custom services
✅ Archive custom service
❌ Create with invalid duration → 400
```

**Validates:**
- Global service catalog
- Per-store pricing overrides
- State machine: DRAFT → PUBLISHED → ARCHIVED

---

### Features (7 tests)

**File:** `features/features.test.js`

```javascript
✅ Schedule pickup (TelePickup)
✅ Confirm pickup
✅ List pickups
✅ Create live stream
✅ Get pet streams
✅ Delete stream
❌ Invalid time window → 400
```

**Validates:**
- TelePickup feature (30min minimum window)
- Live Camera feature
- Feature-specific validation

---

### SaaS Isolation (13 tests)

**File:** `saas/saas-isolation.test.js`

```javascript
✅ Create 2 organizations
✅ Create users in each org
✅ Org 1 cannot see Org 2 stores
✅ Org 2 cannot see Org 1 stores
✅ Cross-tenant store access → 404
✅ Cross-tenant customer access → 404
✅ Service catalog isolation
✅ OrganizationId in token validated
... 5 more isolation tests
```

**Validates:**
- Complete data isolation
- Cross-tenant access prevention (404, not 403!)
- Organization-scoped queries
- JWT token validation

---

### SaaS Limits (4 tests)

**File:** `saas/saas-limits.test.js`

```javascript
✅ Create first store (within limit)
❌ Create second store → 400 STORE_LIMIT_EXCEEDED
✅ Create first employee (within limit)
❌ Create third employee → 400 EMPLOYEE_LIMIT_EXCEEDED
```

**Validates:**
- Plan limits enforcement
- BASIC plan: 1 store, 2 employees
- Clear error messages with current/max counts

---

### Employees Hierarchy (10 tests)

**File:** `employees/employees-hierarchy.test.js`

```javascript
✅ SUPER_ADMIN creates OWNER
✅ OWNER creates ADMIN
✅ ADMIN creates STAFF
✅ ADMIN creates VIEWER
❌ STAFF cannot create → 403
❌ ADMIN cannot create OWNER → 403
✅ Filter by role (STAFF)
✅ Filter by jobTitle (GROOMER)
✅ Create with different jobTitles
✅ List all employees
```

**Validates:**
- Role hierarchy (OWNER > ADMIN > STAFF > VIEWER)
- 17 job titles
- Permission cascading

---

### Feature Scalability (6 tests)

**File:** `features/features-scalability.test.js`

```javascript
✅ Add new feature dynamically
✅ Enable feature on store
✅ List store features
✅ Create 5 new features (proves scalability)
✅ Enable multiple features
✅ Disable feature
```

**Validates:**
- Database-driven features
- No code changes needed
- Ready for 20+ features

---

### Validation Errors (12 tests)

**File:** `errors/validation-errors.test.js`

```javascript
❌ Invalid email → 400
❌ Empty name → 400
❌ Short password (<6 chars) → 400
❌ Multiple validation errors → 400 (array)
❌ Invalid ID (not found) → 404
❌ Pet weight negative → 400
❌ Pet weight > 200kg → 400
... 5 more validation tests
```

**Validates:**
- DTO validation (class-validator)
- Error message format
- HTTP status codes

---

### Permission Errors (2 tests)

**File:** `errors/permission-errors.test.js`

```javascript
❌ VIEWER tries to create employee → 403 ROLE_NOT_ALLOWED
❌ User without employee → 403 FORBIDDEN
```

**Validates:**
- Authorization guards
- Role-based access control

---

## 🛠️ Utility Scripts

### Setup Scripts

```bash
# Setup SUPER_ADMIN user
node test/automation/setup-superuser.js

# Update organization limits
node test/automation/update-org-limits.js

# Reset database
node test/automation/reset-database.js
```

### Helper Functions

**File:** `helpers/superadmin-login.js`

```javascript
const { loginAsSuperAdmin } = require('./helpers/superadmin-login.js');
const { accessToken } = await loginAsSuperAdmin();
```

---

## 📋 Test Output Example

```
╔════════════════════════════════════════════════════════════════════╗
║         SUPERPET API - SUITE COMPLETA DE TESTES                   ║
║                  Arquitetura SaaS Multi-Tenant                    ║
╚════════════════════════════════════════════════════════════════════╝

📝 MÓDULO 1/12: Autenticação
✅ POST /auth/register
✅ POST /auth/login
✅ GET /auth/me
✅ Login wrong password (401)
✅ Register duplicate email (400)
✅ Unauthorized access (401)

... 82 more tests ...

╔════════════════════════════════════════════════════════════════════╗
║                    RESULTADO FINAL                                 ║
╚════════════════════════════════════════════════════════════════════╝

📊 Resumo Geral:
   ────────────────────────────────────────────────────────
   │ Módulo            │ Status    │ Testes           │
   ────────────────────────────────────────────────────────
   │ Auth              │ ✅ PASSOU │ 6 testes         │
   │ Stores & Features │ ✅ PASSOU │ 7 testes         │
   │ Customers         │ ✅ PASSOU │ 8 testes         │
   │ Pets              │ ✅ PASSOU │ 6 testes         │
   │ Services          │ ✅ PASSOU │ 7 testes         │
   │ Features Extras   │ ✅ PASSOU │ 7 testes         │
   │ SaaS Isolation    │ ✅ PASSOU │ 13 testes        │
   │ SaaS Limits       │ ✅ PASSOU │ 4 testes         │
   │ Employees Hier.   │ ✅ PASSOU │ 10 testes        │
   │ Features Scale    │ ✅ PASSOU │ 6 testes         │
   │ Validation Errors │ ✅ PASSOU │ 12 testes        │
   │ Permission Errors │ ✅ PASSOU │ 2 testes         │
   ────────────────────────────────────────────────────────
   │ TOTAL             │ ✅ PASSOU │ 88 testes        │
   ────────────────────────────────────────────────────────

⏱️  Tempo total: 9.66s

╔════════════════════════════════════════════════════════════════════╗
║              ✅ TODOS OS TESTES PASSARAM! 🎉                       ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Test Guidelines

### Writing New Tests

```javascript
// test/automation/my-module/my-module.test.js
const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';
let accessToken = null;

async function test1_Something() {
  console.log('Test 1: POST /my-endpoint');
  
  try {
    const response = await axios.post(`${BASE_URL}/my-endpoint`, {
      data: 'value'
    }, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    assert.strictEqual(response.status, 201);
    console.log('   ✅ Test passed');
  } catch (error) {
    console.error('   ❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

async function runAllTests() {
  try {
    await test1_Something();
    // ... more tests
    
    console.log('✅ ALL TESTS PASSED!');
    return { success: true };
  } catch (error) {
    console.error('❌ Tests failed');
    throw error;
  }
}

module.exports = { runAllTests };
```

### Best Practices

✅ **DO:**
- Use unique data for each test run (timestamps)
- Clean up test data (or use separate test database)
- Test both success and error scenarios
- Use descriptive test names
- Log test progress clearly

❌ **DON'T:**
- Rely on specific IDs (they change)
- Leave test data in production
- Skip error scenario tests
- Use generic error messages

---

## 🔍 Debugging Tests

### Run Individual Module

```bash
node test/automation/auth/auth.test.js
node test/automation/customers/customers.test.js
```

### Check API Logs

While tests run, watch the API terminal for:
- Business rule logs: `[BUSINESS RULE]`
- Plan limits: `[PLAN LIMITS]`
- Role hierarchy: `[ROLE HIERARCHY]`

### Common Issues

**Connection Refused:**
```bash
# Make sure API is running
npm run start:local
```

**Tests Fail After Code Changes:**
```bash
# Rebuild and restart
npm run build
npm run start:local
```

**Database Issues:**
```bash
# Reset and reseed
node test/automation/reset-database.js
npm run migration:run:local
npm run seed:local
```

---

## ✅ Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run migration:run:local
      - run: npm run seed:local
      - run: npm run start:local &
      - run: sleep 5
      - run: node test/automation/run-all-tests.js
```

---

**✨ All 88 tests covering authentication, authorization, business rules, SaaS isolation, and error handling!**
