# 📦 SuperPet API - Postman Collections

Complete Postman collections for all API modules with automated tests and variable management.

---

## 📚 Available Collections

| # | Collection | Endpoints | Description |
|---|------------|-----------|-------------|
| 1 | [**Auth**](./auth/) | 7 | Authentication, password recovery & refresh token ✨ |
| 2 | [**Admin**](./admin/) | 11 | SUPER_ADMIN: organizations, stores, owners & features 🆕 |
| 3 | [**Employees**](./employees/) | 10 | Employee management with roles & job titles |
| 4 | [**Stores**](./stores/) | 12 | Store management & feature configuration |
| 5 | [**Customers**](./customers/) | 11 | Customer, addresses & personal data |
| 6 | [**Pets**](./pets/) | 7 | Pet management with multi-species support |
| 7 | [**Services**](./services/) | 13 | Service catalog & store-specific pricing |
| 8 | [**Features**](./features/) | 8 | TelePickup & Live Camera features |
| 9 | [**Bookings**](./bookings/) | 6 | Online booking system 🆕 |
| 10 | [**Veterinary**](./veterinary/) | 7 | Medical records & vaccinations 🆕 |
| 11 | [**Inventory**](./inventory/) | 13 | Stock & product management 🆕 |
| 12 | [**Reports**](./reports/) | 4 | Analytics & business intelligence 🆕 |
| 13 | [**Fiscal**](./fiscal/) | 6 | Invoicing (NF-e/NFC-e) with SaaS feature enforcement 🆕 |

**Total: 138+ endpoints documented** (with SaaS features)

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

### 🔐 Auth Collection (7 endpoints)
**Authentication:**
- POST /auth/register
- POST /auth/login
- GET /auth/me

**Password Management:** ✨
- POST /auth/change-password
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/refresh

**Features:**
- Auto-saves JWT token & refresh token
- Password recovery flow with 64-char tokens
- Token expiry: access 15min, refresh 7d

### 👥 Employees Collection (10 endpoints)
- POST /employees (create with role)
- GET /employees (with filters)
- GET /employees/:id
- PUT /employees/:id

**Filters:**
- `?role=STAFF`
- `?jobTitle=GROOMER`
- `?storeId=UUID`
- `?active=true`

### 🏪 Stores Collection (12 endpoints)
**Store Management:**
- POST /stores
- GET /stores
- GET /stores/:id
- PUT /stores/:id
- PATCH /stores/:id/status
- PUT /stores/:id/opening-hours
- PUT /stores/:id/capacity
- PUT /stores/:id/blackouts

**Feature Configuration:**
- GET /stores/:id/features
- PUT /stores/:id/features/:key (enable/disable)

### 👤 Customers Collection (11 endpoints)
**Customer Management:**
- POST /customers
- GET /customers
- GET /customers/:id
- PUT /customers/:id
- PATCH /customers/:id/status

**Addresses:**
- GET /customers/:id/addresses
- POST /customers/:id/addresses
- PUT /customers/:id/addresses/:addressId
- PATCH /customers/:id/addresses/:addressId/primary

**Personal Data (PII):**
- GET /customers/:id/personal-data
- PUT /customers/:id/personal-data

### 🐾 Pets Collection (7 endpoints)
- POST /customers/:customerId/pets
- GET /customers/:customerId/pets
- GET /pets/:id
- PUT /pets/:id
- PATCH /pets/:id/status

**Species Supported:**
- DOG, CAT, BIRD, RABBIT, HAMSTER, FISH, REPTILE, OTHER

### 💼 Services Collection (13 endpoints)
**Service Catalog:**
- POST /services
- GET /services
- GET /services/:id
- PUT /services/:id
- PATCH /services/:id/status
- PUT /services/:id/addons

**Custom Services (Store Pricing):**
- GET /stores/:storeId/custom-services
- GET /stores/:storeId/custom-services/:id
- POST /stores/:storeId/custom-services
- PUT /stores/:storeId/custom-services/:id
- POST /stores/:storeId/custom-services/:id/publish
- POST /stores/:storeId/custom-services/:id/archive
- DELETE /stores/:storeId/custom-services/:id

### 🎯 Features Collection (8 endpoints)
**TelePickup:**
- GET /stores/:storeId/pickups
- POST /stores/:storeId/pickups
- PATCH /stores/:storeId/pickups/:id/status

**Live Camera:**
- POST /stores/:storeId/live-cam/streams
- GET /customers/:customerId/pets/:petId/live-cam
- DELETE /stores/:storeId/live-cam/streams/:id

### 👨‍💼 Admin Collection (11 endpoints) 🆕
**SUPER_ADMIN Only:**
- GET /admin/organizations
- POST /admin/organizations
- POST /admin/organizations/:id/stores
- POST /admin/organizations/:id/owners

**Feature Orchestration:**
- GET /admin/features
- GET /admin/stores/:storeId/features
- POST /admin/stores/:storeId/features/:key
- PUT /admin/stores/:storeId/features/:key/limits
- DELETE /admin/stores/:storeId/features/:key
- GET /admin/organizations/:orgId/stores-features

### 📅 Bookings Collection (6 endpoints) 🆕
- POST /bookings
- GET /bookings/stores/:storeId
- GET /bookings/customers/:customerId
- PATCH /bookings/:id/confirm
- PATCH /bookings/:id/complete
- PATCH /bookings/:id/cancel

**Status Flow:** PENDING → CONFIRMED → COMPLETED

### 🏥 Veterinary Collection (7 endpoints) 🆕
**Medical Records:**
- POST /veterinary/records
- GET /veterinary/records/:id
- GET /veterinary/pets/:petId/records
- PUT /veterinary/records/:id

**Vaccinations:**
- POST /veterinary/vaccinations
- GET /veterinary/pets/:petId/vaccinations
- GET /veterinary/pets/:petId/vaccinations/upcoming

### 📦 Inventory Collection (13 endpoints) 🆕
**Products:**
- POST /products
- GET /products
- GET /products/:id
- PUT /products/:id
- DELETE /products/:id

**Stock Management:**
- GET /stores/:storeId/stock
- POST /stores/:storeId/stock/movements
- POST /stores/:storeId/stock/adjust
- GET /stores/:storeId/stock/movements
- GET /stores/:storeId/stock/alerts

**Transfers:**
- POST /transfers
- GET /stores/:storeId/expiring

### 📊 Reports Collection (4 endpoints) 🆕
- GET /reports/dashboard
- GET /reports/customers
- GET /reports/pets
- GET /reports/stores/:storeId/performance

**Periods:** DAY, WEEK, MONTH, YEAR, CUSTOM

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
| Auth | `refresh_token` | Login response ✨ |
| Auth | `reset_token` | Forgot password response ✨ |
| Auth | `user_id` | User ID from response |
| Admin | `super_admin_id` | SUPER_ADMIN login 🆕 |
| Admin | `organization_id` | Create organization 🆕 |
| Employees | `employee_id` | Create employee response |
| Stores | `store_id` | Create store response |
| Customers | `customer_id` | Create customer response |
| Pets | `pet_id` | Create pet response |
| Services | `service_id` | Create service response |
| Services | `custom_service_id` | Create custom service response |
| Features | `pickup_id` | Create pickup response |
| Features | `stream_id` | Create stream response |
| Bookings | `booking_id` | Create booking 🆕 |
| Veterinary | `record_id` | Create record 🆕 |
| Veterinary | `vaccination_id` | Create vaccination 🆕 |
| Inventory | `product_id` | Create product 🆕 |

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

