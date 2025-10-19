# 🌐 API Reference

Complete API endpoint reference with SaaS multi-tenancy rules.

---

## 🔐 Authentication

All endpoints require JWT token (except `/auth/*`).

### Headers

```http
Authorization: Bearer <token>
X-Organization-Id: <uuid>  # Optional, overrides JWT claim
```

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get token |
| GET | `/auth/me` | Get current user profile |

**Register/Login Response:**
```json
{
  "access_token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "organizationId": "uuid"
  }
}
```

---

## 👥 Employees

**Role Hierarchy:** `OWNER > ADMIN > STAFF > VIEWER`

### Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/v1/employees` | OWNER/ADMIN | Create employee |
| GET | `/v1/employees` | All | List employees |
| GET | `/v1/employees/:id` | All | Get by ID |
| PUT | `/v1/employees/:id` | OWNER/ADMIN | Update |
| DELETE | `/v1/employees/:id` | OWNER | Delete |

### Create Employee

```http
POST /v1/employees
{
  "email": "staff@example.com",
  "name": "Staff Member",
  "password": "password123",
  "role": "STAFF",
  "jobTitle": "GROOMER",
  "storeIds": ["store-uuid"] # Optional, for STAFF/VIEWER
}
```

**Role Rules:**
- `OWNER` can create: OWNER, ADMIN, STAFF, VIEWER
- `ADMIN` can create: STAFF, VIEWER
- `STAFF`/`VIEWER` cannot create

**17 Job Titles:** OWNER, MANAGER, RECEPTIONIST, VETERINARIAN, GROOMER, BATHER, PET_HANDLER, TRAINER, etc.

---

## 🏪 Stores

**Access:** OWNER/ADMIN see all stores | STAFF/VIEWER see only assigned stores

### Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/v1/stores` | OWNER | Create store |
| GET | `/v1/stores` | All | List stores |
| GET | `/v1/stores/:id` | All | Get by ID |
| PUT | `/v1/stores/:id` | OWNER/ADMIN | Update |
| DELETE | `/v1/stores/:id` | OWNER | Delete |

### Create Store

```http
POST /v1/stores
{
  "code": "STORE_001",
  "name": "SuperPet Downtown",
  "timezone": "America/Manaus",
  "openingHours": {
    "mon": [["08:00", "18:00"]],
    "tue": [["08:00", "18:00"]],
    "sat": [["09:00", "13:00"]]
  },
  "resourcesCatalog": ["GROOMER", "VET"],
  "capacity": {
    "GROOMER": 2,
    "VET": 1
  },
  "blackoutDates": ["2025-12-25", "2026-01-01"]
}
```

---

## ⚡ Features (Dynamic)

Features are database-driven and can be enabled/disabled per store.

### Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/v1/stores/:storeId/features` | All | List features |
| PUT | `/v1/stores/:storeId/features/:key` | OWNER/ADMIN | Configure |

### Configure Feature

```http
PUT /v1/stores/:storeId/features/TELEPICKUP
{
  "enabled": true,
  "customLimit": 50
}
```

**10+ Features:** TELEPICKUP, LIVE_CAM, ONLINE_BOOKING, MULTI_SERVICE, PET_HOTEL, etc.

---

## 👤 Customers

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/customers` | Create customer |
| GET | `/v1/customers` | List customers |
| GET | `/v1/customers/:id` | Get by ID |
| PUT | `/v1/customers/:id` | Update |
| PATCH | `/v1/customers/:id/status` | Update status |

### Create Customer

```http
POST /v1/customers
{
  "name": "John Doe",
  "email": "john@example.com", # At least one contact required
  "phone": "+5592988887777",
  "marketingConsent": {
    "email": true,
    "sms": false,
    "whatsapp": true
  },
  "source": "WEBSITE"
}
```

**Status:** ACTIVE, INACTIVE, BLOCKED

**Source:** WALK_IN, WEBSITE, PHONE, REFERRAL, APP

### Addresses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/customers/:id/addresses` | Add address |
| GET | `/v1/customers/:id/addresses` | List addresses |
| PATCH | `/v1/customers/:id/addresses/:addressId/primary` | Set primary |

### Personal Data (PII Protected)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/v1/customers/:id/personal-data` | OWNER/ADMIN | Get PII |
| PUT | `/v1/customers/:id/personal-data` | OWNER/ADMIN | Update PII |

```http
PUT /v1/customers/:id/personal-data
{
  "cpf": "12345678900",
  "rg": "1234567",
  "issuer": "SSP-AM",
  "birthdate": "1990-05-01",
  "gender": "M"
}
```

---

## 🐾 Pets

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/customers/:customerId/pets` | Create pet |
| GET | `/v1/customers/:customerId/pets` | List customer pets |
| GET | `/v1/pets/:id` | Get by ID |
| PUT | `/v1/pets/:id` | Update |
| PATCH | `/v1/pets/:id/status` | Update status |

### Create Pet

```http
POST /v1/customers/:customerId/pets
{
  "name": "Thor",
  "species": "DOG",
  "breed": "Labrador",
  "birthdate": "2020-01-15",
  "weightKg": 32.5,
  "allergies": ["Chicken"],
  "microchip": "123456789",
  "notes": "Friendly dog"
}
```

**Species:** DOG, CAT, BIRD, REPTILE, RODENT, FISH, OTHER

**Status:** ACTIVE, DECEASED

**Business Rule:** Cannot schedule services for DECEASED pets

---

## 💼 Services

Global service catalog with per-store pricing overrides.

### Service Catalog

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/services` | Create service (OWNER) |
| GET | `/v1/services` | List services |
| GET | `/v1/services/:id` | Get by ID |
| PUT | `/v1/services/:id` | Update (OWNER) |

### Custom Services (Store Overrides)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/stores/:storeId/custom-services` | Override pricing |
| GET | `/v1/stores/:storeId/custom-services` | List overrides |
| POST | `/v1/stores/:storeId/custom-services/:id/publish` | Activate |
| POST | `/v1/stores/:storeId/custom-services/:id/archive` | Deactivate |

### Create Service

```http
POST /v1/services
{
  "code": "BATH_SMALL",
  "name": "Bath - Small Dog",
  "description": "Complete bath for small dogs",
  "durationMinutes": 60,
  "bufferBefore": 10,
  "bufferAfter": 10,
  "resourcesRequired": ["GROOMER"],
  "visibility": "PUBLIC",
  "priceBaseCents": 5000,
  "taxCode": "SERVICE_01"
}
```

### Override Store Pricing

```http
POST /v1/stores/:storeId/custom-services
{
  "serviceId": "service-uuid",
  "priceOverrideCents": 4500, # R$ 45.00
  "state": "DRAFT"
}

# Then publish
POST /v1/stores/:storeId/custom-services/:id/publish
```

**States:** DRAFT → PUBLISHED → ARCHIVED

---

## 📦 TelePickup (Feature)

Pet pickup scheduling with time windows.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/stores/:storeId/pickups` | Schedule pickup |
| GET | `/v1/stores/:storeId/pickups` | List pickups |
| PATCH | `/v1/stores/:storeId/pickups/:id/status` | Update status |

### Schedule Pickup

```http
POST /v1/stores/:storeId/pickups
{
  "petId": "pet-uuid",
  "scheduledDate": "2025-10-20",
  "timeWindowStart": "14:00",
  "timeWindowEnd": "16:00", # Min 30 minutes
  "notes": "Ring doorbell"
}
```

**Status:** PENDING → CONFIRMED → COMPLETED | CANCELLED

---

## 📹 Live Camera (Feature)

Real-time pet monitoring streams.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/stores/:storeId/live-cam/streams` | Create stream |
| GET | `/v1/customers/:customerId/pets/:petId/live-cam` | Get pet streams |
| DELETE | `/v1/stores/:storeId/live-cam/streams/:id` | End stream |

### Create Stream

```http
POST /v1/stores/:storeId/live-cam/streams
{
  "petId": "pet-uuid",
  "streamUrl": "https://player.example.com/live/stream123",
  "expiresAt": "2025-10-20T18:00:00Z"
}
```

**Status:** OFFLINE, ONLINE, ERROR

---

## 🔒 Multi-Tenancy Rules

### Tenant Isolation

**All data is scoped by `organizationId`:**
- Automatic filtering in all queries
- Cross-tenant access returns `404` (not `403`)
- Unique constraints per organization

### Examples

```typescript
// ✅ Good: Scoped by organization
GET /v1/customers?organizationId=<from-jwt>

// ❌ Bad: No cross-tenant access
GET /v1/customers/:other-org-customer-id
// Returns: 404 Not Found (not 403 Forbidden!)
```

### Unique Constraints (Per Organization)

- Users: `(organizationId, email)`
- Stores: `(organizationId, code)`
- Customers: `(organizationId, email)`
- Pets: `(organizationId, microchip)`
- Services: `(organizationId, code)`

---

## 📊 Plan Limits

Plans enforce limits on resources:

| Plan | Stores | Employees | Appointments/mo |
|------|--------|-----------|-----------------|
| FREE | 1 | 5 | 100 |
| BASIC | 3 | 20 | 1,000 |
| PRO | 10 | 50 | 5,000 |
| ENTERPRISE | Unlimited | Unlimited | Unlimited |

### Limit Errors

```json
{
  "statusCode": 400,
  "message": "STORE_LIMIT_EXCEEDED: Plan BASIC allows max 3 stores. Current: 3",
  "error": "Bad Request"
}
```

---

## 📋 Query Parameters

### Pagination

```http
GET /v1/customers?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Filters

```http
GET /v1/employees?role=STAFF&jobTitle=GROOMER&active=true
GET /v1/customers?status=ACTIVE&query=john
GET /v1/pets?species=DOG&status=ACTIVE
GET /v1/services?visibility=PUBLIC
```

---

## 🚨 Error Responses

### Format

```json
{
  "statusCode": 400,
  "message": "ERROR_CODE: Descriptive message",
  "error": "Bad Request"
}
```

### Common Errors

| Code | Status | Description |
|------|--------|-------------|
| `FORBIDDEN` | 403 | Missing permissions |
| `ROLE_NOT_ALLOWED` | 403 | Role hierarchy violation |
| `STORE_ACCESS_DENIED` | 403 | No access to store |
| `NOT_FOUND` | 404 | Resource not found |
| `MISSING_CONTACT` | 400 | No email/phone provided |
| `EMAIL_ALREADY_EXISTS` | 400 | Email taken |
| `INVALID_WEIGHT` | 400 | Pet weight out of range |
| `PET_DECEASED` | 403 | Cannot schedule for deceased pet |
| `STORE_LIMIT_EXCEEDED` | 400 | Plan limit reached |
| `EMPLOYEE_LIMIT_EXCEEDED` | 400 | Plan limit reached |

See [ERRORS.md](./ERRORS.md) for complete error reference.

---

## 📚 Postman Collections

Complete collections available in `docs/collections/`:

1. **Auth** - 3 endpoints
2. **Employees** - 10 endpoints
3. **Stores** - 12 endpoints
4. **Customers** - 11 endpoints
5. **Pets** - 7 endpoints
6. **Services** - 13 endpoints
7. **Features** - 8 endpoints

**Total:** 64 documented endpoints with examples

---

## ✅ API Standards

### Versioning
- All endpoints prefixed with `/v1`
- Future versions: `/v2`, `/v3`

### HTTP Methods
- `GET` - Read
- `POST` - Create
- `PUT` - Update (full)
- `PATCH` - Update (partial)
- `DELETE` - Delete

### Status Codes
- `200` - OK
- `201` - Created
- `204` - No Content (delete success)
- `400` - Bad Request (validation)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Timestamps
- All dates in ISO 8601: `2025-10-20T14:30:00Z`
- Timezone: UTC
- Store-specific times use store's timezone

---

## 📚 Related Documentation

- [SETUP.md](./SETUP.md) - Environment and scripts
- [DATABASE.md](./DATABASE.md) - Database schema
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [ERRORS.md](./ERRORS.md) - Error handling

---

**✨ API is production-ready with 64 documented endpoints!**

