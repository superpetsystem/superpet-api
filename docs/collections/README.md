# 📦 SuperPet API - Postman Collections

Complete Postman collections for all API modules with automated tests and variable management.

---

## 📚 Available Collections

| # | Collection | Endpoints | Description |
|---|------------|-----------|-------------|
| 1 | [**Auth**](./auth/) | 3 | Authentication & user profile |
| 2 | [**Employees**](./employees/) | 10 | Employee management with roles & job titles |
| 3 | [**Stores**](./stores/) | 12 | Store management & feature configuration |
| 4 | [**Customers**](./customers/) | 11 | Customer, addresses & personal data |
| 5 | [**Pets**](./pets/) | 7 | Pet management with multi-species support |
| 6 | [**Services**](./services/) | 13 | Service catalog & store-specific pricing |
| 7 | [**Features**](./features/) | 8 | TelePickup & Live Camera features |

**Total: 64 endpoints documented**

---

## 🚀 Quick Start

### 1. Import Collections

```bash
# In Postman:
1. Click "Import"
2. Select all JSON files from docs/collections/
3. Collections will be imported automatically
```

### 2. Set Global Variables

Create a Postman Environment with:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "organization_id": "00000000-0000-0000-0000-000000000001"
}
```

### 3. Authentication Flow

1. Run **Auth** > **1. Register** or **2. Login**
2. Token is auto-saved to collection variables
3. All other requests use `{{access_token}}` automatically

---

## 📋 Collection Details

### 🔐 Auth Collection (3 endpoints)
- POST /auth/register
- POST /auth/login
- GET /auth/me

**Features:**
- Auto-saves JWT token
- Sets user_id variable
- Automatic Bearer prefix

### 👥 Employees Collection (10 endpoints)
- POST /v1/employees (create with role)
- GET /v1/employees (with filters)
- GET /v1/employees/:id
- PUT /v1/employees/:id

**Filters:**
- `?role=STAFF`
- `?jobTitle=GROOMER`
- `?storeId=UUID`
- `?active=true`

### 🏪 Stores Collection (12 endpoints)
**Store Management:**
- POST /v1/stores
- GET /v1/stores
- GET /v1/stores/:id
- PUT /v1/stores/:id
- PATCH /v1/stores/:id/status
- PUT /v1/stores/:id/opening-hours
- PUT /v1/stores/:id/capacity
- PUT /v1/stores/:id/blackouts

**Feature Configuration:**
- GET /v1/stores/:id/features
- PUT /v1/stores/:id/features/:key (enable/disable)

### 👤 Customers Collection (11 endpoints)
**Customer Management:**
- POST /v1/customers
- GET /v1/customers
- GET /v1/customers/:id
- PUT /v1/customers/:id
- PATCH /v1/customers/:id/status

**Addresses:**
- GET /v1/customers/:id/addresses
- POST /v1/customers/:id/addresses
- PUT /v1/customers/:id/addresses/:addressId
- PATCH /v1/customers/:id/addresses/:addressId/primary

**Personal Data (PII):**
- GET /v1/customers/:id/personal-data
- PUT /v1/customers/:id/personal-data

### 🐾 Pets Collection (7 endpoints)
- POST /v1/customers/:customerId/pets
- GET /v1/customers/:customerId/pets
- GET /v1/pets/:id
- PUT /v1/pets/:id
- PATCH /v1/pets/:id/status

**Species Supported:**
- DOG, CAT, BIRD, RABBIT, HAMSTER, FISH, REPTILE, OTHER

### 💼 Services Collection (13 endpoints)
**Service Catalog:**
- POST /v1/services
- GET /v1/services
- GET /v1/services/:id
- PUT /v1/services/:id
- PATCH /v1/services/:id/status
- PUT /v1/services/:id/addons

**Custom Services (Store Pricing):**
- GET /v1/stores/:storeId/custom-services
- GET /v1/stores/:storeId/custom-services/:id
- POST /v1/stores/:storeId/custom-services
- PUT /v1/stores/:storeId/custom-services/:id
- POST /v1/stores/:storeId/custom-services/:id/publish
- POST /v1/stores/:storeId/custom-services/:id/archive
- DELETE /v1/stores/:storeId/custom-services/:id

### 🎯 Features Collection (8 endpoints)
**TelePickup:**
- GET /v1/stores/:storeId/pickups
- POST /v1/stores/:storeId/pickups
- PATCH /v1/stores/:storeId/pickups/:id/status

**Live Camera:**
- POST /v1/stores/:storeId/live-cam/streams
- GET /v1/customers/:customerId/pets/:petId/live-cam
- DELETE /v1/stores/:storeId/live-cam/streams/:id

---

## 🔄 Workflow Example

### Complete Flow: Create Customer → Add Pet → Schedule Service

```
1. Auth Collection
   └─> Login → Get Token

2. Customers Collection
   └─> Create Customer → Save customer_id

3. Pets Collection
   └─> Create Pet → Save pet_id

4. Services Collection
   └─> Create Service → Create Custom Service for Store

5. Features Collection
   └─> Schedule TelePickup → Create Live Stream
```

---

## 🎯 Variable Management

### Auto-Saved Variables

Collections automatically save these variables on successful responses:

| Collection | Variable | Saved From |
|-----------|----------|------------|
| Auth | `access_token` | Register/Login response |
| Auth | `user_id` | User ID from response |
| Employees | `employee_id` | Create employee response |
| Stores | `store_id` | Create store response |
| Customers | `customer_id` | Create customer response |
| Pets | `pet_id` | Create pet response |
| Services | `service_id` | Create service response |
| Services | `custom_service_id` | Create custom service response |
| Features | `pickup_id` | Create pickup response |
| Features | `stream_id` | Create stream response |

---

## ⚠️ Important Notes

### Authentication
- All endpoints (except /auth/register and /auth/login) require JWT token
- Token format: `Bearer eyJhbGciOiJIUzI1NiIs...`
- Token expires in 15 minutes (configurable)

### Multi-Tenancy
- All data is isolated by organization
- `organizationId` is extracted from JWT token
- Cross-tenant access returns 404 (not 403 to prevent info leakage)

### Role-Based Access
- Some endpoints require specific roles:
  - **OWNER/ADMIN**: Personal data, employee management
  - **STAFF**: Store-level access (via employee_stores)
  - **VIEWER**: Read-only access

---

## 📖 Documentation

- [API Endpoints Guide](../guides/API-ENDPOINTS.md) - Complete API reference
- [Architecture](../guides/ARCHITECTURE.md) - System architecture
- [SaaS Rules](../guides/SAAS-RULES.md) - Multi-tenancy rules

---

## 🤝 Contributing

### Adding New Collection

1. Create folder: `docs/collections/{module}/`
2. Add collection JSON: `SuperPet-{Module}.postman_collection.json`
3. Add README: `README.md` with setup instructions
4. Update this index

### Collection Standards

- ✅ Use descriptive request names
- ✅ Include request descriptions
- ✅ Add test scripts for variable auto-save
- ✅ Group related requests in folders
- ✅ Provide example request bodies
- ✅ Include validation notes

---

<div align="center">

**[← Back to Main Documentation](../README.md)**

</div>

