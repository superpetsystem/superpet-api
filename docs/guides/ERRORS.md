# 🚨 Error Handling & Logging

Complete guide for error codes, logging patterns, and business rules.

---

## 📊 HTTP Status Codes

| Code | Status | Usage |
|------|--------|-------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Unexpected error |

---

## 🔐 Error Response Format

```json
{
  "statusCode": 400,
  "message": "ERROR_CODE: Descriptive message",
  "error": "Bad Request"
}
```

### With Validation Details

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

---

## 🔴 Error Codes Reference

### Authentication (401)

| Code | Message | When |
|------|---------|------|
| `UNAUTHORIZED` | Missing or invalid token | No Authorization header or invalid JWT |
| `Invalid credentials` | Wrong email/password | Login failed |
| `User is not active` | User account suspended | User status != ACTIVE |

### Authorization (403)

| Code | Message | When |
|------|---------|------|
| `FORBIDDEN` | Missing employee record | User has no employee |
| `ROLE_NOT_ALLOWED` | Role hierarchy violation | Insufficient role |
| `STORE_ACCESS_DENIED` | No access to store | STAFF/VIEWER not linked to store |
| `PET_DECEASED` | Cannot schedule for deceased pet | Pet status is DECEASED |
| `CUSTOMER_INACTIVE` | Customer not active | Customer status != ACTIVE |

### Validation (400)

| Code | Message | When |
|------|---------|------|
| `MISSING_CONTACT` | At least one contact required | No email AND no phone |
| `CUSTOMER_EMAIL_TAKEN` | Email already registered | Duplicate customer email |
| `EMAIL_ALREADY_EXISTS` | Email already exists | Duplicate user/employee email |
| `INVALID_WEIGHT` | Weight must be between 0-200kg | Pet weight out of range |
| `MICROCHIP_TAKEN` | Microchip already registered | Duplicate microchip |
| `STORE_LIMIT_EXCEEDED` | Plan limit reached | Max stores exceeded |
| `EMPLOYEE_LIMIT_EXCEEDED` | Plan limit reached | Max employees exceeded |
| `INVALID_DURATION` | Duration invalid | Service duration < 1 minute |

### Not Found (404)

| Code | Message | When |
|------|---------|------|
| `NOT_FOUND` | Resource not found | ID doesn't exist or cross-tenant |

**Security Note:** Cross-tenant access returns `404` (not `403`) to prevent data leakage.

---

## 📝 Logging System

### Log Levels

```typescript
logger.log('✅ Success message');      // Info
logger.warn('⚠️  Warning message');    // Warning
logger.error('❌ Error message');      // Error
```

### Log Categories

| Category | Prefix | Usage |
|----------|--------|-------|
| **Business Rules** | `[BUSINESS RULE]` | Validation logic |
| **Plan Limits** | `[PLAN LIMITS]` | SaaS limits |
| **Role Hierarchy** | `[ROLE HIERARCHY]` | Permission checks |
| **Security** | `[SECURITY]` | Cross-tenant, auth |

---

## 🔍 Business Rule Logs

### CustomerService

```typescript
// Success
✅ [BUSINESS RULE] Customer validation passed - Email: user@test.com

// Errors
❌ [BUSINESS RULE] MISSING_CONTACT - Name: John Doe
❌ [BUSINESS RULE] CUSTOMER_EMAIL_TAKEN - Email: existing@test.com, OrgID: uuid
```

**Rules Logged:**
- `MISSING_CONTACT` - No email/phone provided
- `CUSTOMER_EMAIL_TAKEN` - Email already exists in organization

---

### PetService

```typescript
// Success
✅ [BUSINESS RULE] Weight validation passed - 32.5kg
✅ [BUSINESS RULE] Pet can be scheduled - PetID: uuid, Name: Thor

// Errors
❌ [BUSINESS RULE] INVALID_WEIGHT - Weight: 0kg, Range: 0-200kg - Pet: Thor
❌ [BUSINESS RULE] MICROCHIP_TAKEN - Microchip: 123456, OrgID: uuid
❌ [BUSINESS RULE] PET_DECEASED - Cannot schedule for deceased pet - PetID: uuid
❌ [BUSINESS RULE] CUSTOMER_INACTIVE - Cannot schedule for inactive customer - PetID: uuid
```

**Rules Logged:**
- `INVALID_WEIGHT` - Pet weight < 0 or > 200kg
- `MICROCHIP_TAKEN` - Microchip already registered
- `PET_DECEASED` - Cannot schedule services
- `CUSTOMER_INACTIVE` - Owner not active

---

### EmployeeService

```typescript
// Success
✅ [ROLE HIERARCHY] OWNER can create ADMIN
✅ [ROLE HIERARCHY] ADMIN can create STAFF
✅ [BUSINESS RULE] Employee validation passed - Email: staff@test.com

// Errors
❌ [ROLE HIERARCHY] FORBIDDEN - ADMIN trying to create OWNER
❌ [ROLE HIERARCHY] FORBIDDEN - STAFF cannot create employees
❌ [BUSINESS RULE] EMAIL_ALREADY_EXISTS - Email: existing@test.com, OrgID: uuid
```

**Hierarchy Rules:**
- `SUPER_ADMIN` → Can create any role
- `OWNER` → Can create OWNER, ADMIN, STAFF, VIEWER
- `ADMIN` → Can create STAFF, VIEWER
- `STAFF/VIEWER` → Cannot create

---

### PlanLimitsService

```typescript
// Success
✅ [PLAN LIMITS] Store creation allowed - 1/10 - OrgID: uuid
✅ [PLAN LIMITS] Employee creation allowed - 5/50 - OrgID: uuid

// Errors
❌ [PLAN LIMITS] STORE_LIMIT_EXCEEDED - Plan: BASIC, Max: 1, Current: 1, OrgID: uuid
❌ [PLAN LIMITS] EMPLOYEE_LIMIT_EXCEEDED - Plan: BASIC, Max: 2, Current: 2, OrgID: uuid
```

**Plan Limits:**
| Plan | Stores | Employees |
|------|--------|-----------|
| FREE | 1 | 5 |
| BASIC | 3 | 20 |
| PRO | 10 | 50 |
| ENTERPRISE | ∞ | ∞ |

---

## 🎛️ Controller Logs

### Request Logs

```typescript
// Auth
📝 Register attempt - Email: user@test.com
🔐 Login attempt - Email: user@test.com
👤 Profile request - UserID: uuid

// Customers
📋 List customers - OrgID: uuid, Filters: {...}
🔍 Get customer - ID: uuid, OrgID: uuid
📝 Create customer - Email: user@test.com, OrgID: uuid
📝 Update customer - ID: uuid

// Employees
📋 List employees - OrgID: uuid, Filters: {role: STAFF}
📝 Create employee - Email: staff@test.com, Role: STAFF, CreatorRole: OWNER
```

### Success Logs

```typescript
✅ User registered successfully - Email: user@test.com, UserID: uuid
✅ Login successful - Email: user@test.com, UserID: uuid
✅ Customer created - ID: uuid, Name: John Doe
✅ Employee created - ID: uuid, Role: STAFF
```

### Error Logs

```typescript
❌ Register failed - Email: user@test.com, Error: EMAIL_ALREADY_EXISTS
❌ Login failed - Email: user@test.com, Error: Invalid credentials
❌ Create customer failed - Email: user@test.com, Error: MISSING_CONTACT
❌ 404 - Customer not found - ID: uuid
```

### Security Warnings

```typescript
⚠️  Customer not found or cross-tenant access - ID: uuid, UserOrg: org1, CustomerOrg: org2
⚠️  STORE_ACCESS_DENIED - Employee (STAFF) not linked to store - StoreID: uuid
```

---

## 🧪 Testing Error Scenarios

### Run All Tests (88 tests)

```bash
# Terminal 1: Start API
npm run start:local

# Terminal 2: Run tests
npm run test:automation:all
```

### Specific Error Tests

```bash
# Validation errors (12 tests)
node test/automation/errors/validation-errors.test.js

# Permission errors (2 tests)
node test/automation/errors/permission-errors.test.js
```

### What You'll See

```log
[CustomerService] ❌ [BUSINESS RULE] MISSING_CONTACT - Name: Test Customer
[PetService] ❌ [BUSINESS RULE] INVALID_WEIGHT - Weight: 0kg, Range: 0-200kg
[PlanLimitsService] ❌ [PLAN LIMITS] STORE_LIMIT_EXCEEDED - Max: 1, Current: 1
[EmployeeService] ❌ [ROLE HIERARCHY] FORBIDDEN - ADMIN trying to create OWNER
[CustomersController] ⚠️  Cross-tenant access attempt detected
```

---

## 📋 Error Test Coverage

| Module | Tests | Error Scenarios |
|--------|-------|-----------------|
| **Auth** | 6 | Wrong password, duplicate email, no token |
| **Customers** | 8 | Missing contact, duplicate email, not found |
| **Pets** | 6 | Invalid weight, deceased pet, microchip taken |
| **Services** | 7 | Invalid duration, duplicate code |
| **Employees** | 10 | Role violations, email taken, forbidden |
| **Stores** | 7 | Duplicate code, feature disabled |
| **SaaS Limits** | 4 | Store limit, employee limit |
| **Validation** | 12 | Empty fields, invalid formats, out of range |
| **Permission** | 2 | Role not allowed, forbidden access |

**Total:** 62 error scenarios tested ✅

---

## 🔧 Implementing New Error Codes

### 1. Add to Service

```typescript
@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  async validateSomething(data: any): Promise<void> {
    this.logger.log(`🔍 [BUSINESS RULE] Validating - Data: ${JSON.stringify(data)}`);
    
    if (data.invalid) {
      this.logger.error(`❌ [BUSINESS RULE] MY_ERROR_CODE - Details: ${data.id}`);
      throw new BadRequestException('MY_ERROR_CODE: Descriptive message');
    }
    
    this.logger.log(`✅ [BUSINESS RULE] Validation passed - ID: ${data.id}`);
  }
}
```

### 2. Add to Controller

```typescript
@Controller('my-resource')
export class MyController {
  private readonly logger = new Logger(MyController.name);

  @Post()
  async create(@Body() dto: CreateDto) {
    this.logger.log(`📝 Create request - Data: ${JSON.stringify(dto)}`);
    
    try {
      const result = await this.service.create(dto);
      this.logger.log(`✅ Created successfully - ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Create failed - Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### 3. Add Test

```javascript
// test/automation/my-module/my-module.test.js
async function test_ValidationError() {
  try {
    await axios.post(`${BASE_URL}/my-resource`, { invalid: true });
    throw new Error('Should have failed');
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('MY_ERROR_CODE')) {
      console.log('✅ Validation error handled correctly');
    }
  }
}
```

### 4. Add to Documentation

Update this file with:
- Error code in table
- Log examples
- Test coverage

---

## 📚 Related Documentation

- [SETUP.md](./SETUP.md) - Environment and scripts
- [DATABASE.md](./DATABASE.md) - Database schema
- [API.md](./API.md) - API endpoints
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design

---

## ✅ Quick Checklist

When implementing a new feature:

- [ ] Add business rule logs in service
- [ ] Add request/response logs in controller
- [ ] Define error codes and messages
- [ ] Test error scenarios
- [ ] Document error codes here
- [ ] Update Postman collection with error examples

---

**✨ All errors are logged and tested! 88 tests covering 62+ error scenarios.**

