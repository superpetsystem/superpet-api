# SuperPet API

> Enterprise-grade SaaS Multi-Tenant Platform for Pet Business Management

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-74%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)]()
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)]()

A comprehensive REST API platform designed for multi-location pet service businesses, featuring advanced multi-tenancy, role-based access control, dynamic feature management, and enterprise-level scalability.

---

## ✨ Key Features

### 🏢 **Multi-Tenant SaaS Architecture**
- Complete organization isolation with data segregation
- Flexible subscription plans (FREE, BASIC, PRO, ENTERPRISE)
- Configurable limits per plan (employees, stores, appointments)
- Cross-tenant access prevention with 404/403 responses

### 👥 **Advanced Role-Based Access Control**
- **Hierarchical Roles**: SUPER_ADMIN → OWNER → ADMIN → STAFF → VIEWER
- **17 Job Titles**: Veterinarian, Groomer, Receptionist, Manager, and more
- Store-level access control for staff members
- Dynamic permission system with guard composition

### 🎯 **Dynamic Feature System**
- Database-driven feature management (no code changes required)
- Per-store feature activation with custom limits
- 10+ built-in features, scalable to 20+ features
- Feature categories: CORE, SERVICES, CUSTOMER, OPERATIONS, ANALYTICS, INTEGRATIONS

### 🏪 **Multi-Store Management**
- Unlimited stores per organization (plan-dependent)
- Store-specific service pricing and configurations
- Independent operating hours and resource allocation
- Store-feature relationship management

### 📊 **Core Business Modules**
- **Customers**: Full profile management with PII protection
- **Pets**: Multi-species support with health tracking
- **Services**: Flexible catalog with store-level customization
- **Employees**: Complete workforce management
- **Live Features**: TelePickup, Live Camera streams

---

## 🚀 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | NestJS 10.x | Enterprise Node.js framework with TypeScript |
| **ORM** | TypeORM | Type-safe database operations |
| **Database** | MySQL 8.x | Relational data storage |
| **Authentication** | JWT + Passport | Stateless authentication |
| **Validation** | class-validator | DTO validation |
| **Security** | bcrypt | Password hashing |
| **Testing** | Jest | Unit, E2E, and automation tests |

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd superpet-api

# Install dependencies
npm install

# Setup environment
cp env/template.env env/local.env
# Edit env/local.env with your configurations

# Create database
mysql -u root -p -e "CREATE DATABASE superpet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
npm run migration:run:local

# Seed database (optional)
npm run typeorm -- -d src/database/data-source.ts migration:run
node src/database/seeds/run-seed.ts

# Start application
npm run start:local
```

Application will be running at `http://localhost:3000`

---

## 🧪 Testing

### Test Suite Overview
```
╔════════════════════════════════════════════════════════╗
║  88 Tests Passing | 100% Success Rate | ~8s Runtime   ║
╚════════════════════════════════════════════════════════╝
```

### Test Modules
| Module | Tests | Coverage |
|--------|-------|----------|
| Authentication | 6 | 100% |
| Stores & Features | 7 | 100% |
| Customers & Addresses | 8 | 100% |
| Pets | 6 | 100% |
| Services & Custom Services | 7 | 100% |
| Advanced Features | 7 | 100% |
| SaaS Isolation | 13 | 100% |
| Plan Limits | 4 | 100% |
| Employee Hierarchy | 10 | 100% |
| Feature Scalability | 6 | 100% |
| **Validation Errors** | **12** | **100%** ✨ |
| **Permission Errors** | **2** | **100%** ✨ |

### Run Tests

```bash
# Run all automation tests (88 tests)
node test/automation/run-all-tests.js

# Run specific module
node test/automation/auth/auth.test.js
node test/automation/employees/employees-hierarchy.test.js
node test/automation/saas/saas-isolation.test.js

# Run error scenario tests
node test/automation/errors/validation-errors.test.js  # 12 tests
node test/automation/errors/permission-errors.test.js  # 2 tests

# Setup SUPER_ADMIN for testing
node test/automation/setup-superuser.js

# Reset test organization limits
node test/automation/update-org-limits.js
```

---

## 🏗️ Architecture

### Database Schema (14 Tables)

```
┌─────────────────────────────────────────────────────────┐
│                    ORGANIZATIONS                        │
│              (Multi-Tenant Root Entity)                 │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼───┐   ┌───▼───┐   ┌───▼────┐
    │ USERS │   │STORES │   │FEATURES│
    └───┬───┘   └───┬───┘   └────────┘
        │           │
    ┌───┴───┐   ┌───┴──────────┐
    │       │   │               │
┌───▼──┐ ┌─▼─────┐  ┌──────────▼─────┐
│EMPLOYEE│CUSTOMER│  │ STORE_FEATURES │
└───┬───┘└──┬─────┘  └────────────────┘
    │       │
    │   ┌───▼────┐
    │   │ PETS   │
    │   └────────┘
    │   ┌────────┐
    │   │ADDRESS │
    │   └────────┘
    │   ┌─────────┐
    │   │PERSONAL │
    │   │  DATA   │
    │   └─────────┘
    │
    │ N:M via EMPLOYEE_STORES
```

### API Versioning
- **Current Version**: v1
- **Base URL**: `http://localhost:3000/v1`
- **Public Routes**: `/auth/register`, `/auth/login`
- **Protected Routes**: All others require JWT Bearer token

---

## 📚 API Endpoints

### 🔐 Authentication
```http
POST   /auth/register         # Register new user
POST   /auth/login            # Login
GET    /auth/me               # Get current user profile
```

### 👥 Employees
```http
POST   /v1/employees          # Create employee (role-based)
GET    /v1/employees          # List employees (with filters)
GET    /v1/employees/:id      # Get employee details
PUT    /v1/employees/:id      # Update employee
```

### 🏪 Stores
```http
POST   /v1/stores                      # Create store
GET    /v1/stores                      # List stores
GET    /v1/stores/:id                  # Get store details
PUT    /v1/stores/:id                  # Update store
GET    /v1/stores/:id/features         # List store features
PUT    /v1/stores/:id/features/:key    # Configure feature
```

### 👤 Customers
```http
POST   /v1/customers                       # Create customer
GET    /v1/customers                       # List customers
GET    /v1/customers/:id                   # Get customer
PUT    /v1/customers/:id                   # Update customer
PATCH  /v1/customers/:id/status            # Update status
PUT    /v1/customers/:id/personal-data     # Add personal data (CPF, RG)
POST   /v1/customers/:id/addresses         # Create address
GET    /v1/customers/:id/addresses         # List addresses
```

### 🐾 Pets
```http
POST   /v1/customers/:customerId/pets  # Create pet
GET    /v1/customers/:customerId/pets  # List customer's pets
GET    /v1/pets/:id                    # Get pet details
PUT    /v1/pets/:id                    # Update pet
PATCH  /v1/pets/:id/status             # Update pet status
```

### 💼 Services
```http
POST   /v1/services                                          # Create service
GET    /v1/services                                          # List services
GET    /v1/services/:id                                      # Get service
POST   /v1/stores/:storeId/custom-services                   # Create custom service
POST   /v1/stores/:storeId/custom-services/:id/publish       # Publish custom service
POST   /v1/stores/:storeId/custom-services/:id/archive       # Archive custom service
GET    /v1/stores/:storeId/custom-services                   # List store custom services
```

### 🚚 Advanced Features
```http
# TelePickup
POST   /v1/stores/:storeId/pickups              # Schedule pickup
PATCH  /v1/stores/:storeId/pickups/:id/status   # Update pickup status
GET    /v1/stores/:storeId/pickups              # List pickups

# Live Camera
POST   /v1/stores/:storeId/live-cam/streams     # Create stream
GET    /v1/customers/:customerId/pets/:petId/live-cam  # Get pet streams
DELETE /v1/stores/:storeId/live-cam/streams/:id # Delete stream
```

> 📖 **Full API Documentation**: See [API Endpoints Guide](./docs/guides/api-endpoints.md)

---

## 🔒 Security & Authorization

### Authentication Flow
1. **Register/Login** → Receive JWT token
2. **JWT Payload** includes: `userId`, `organizationId`, `employee` data
3. **All requests** must include: `Authorization: Bearer <token>`

### Role Hierarchy & Permissions

```
SUPER_ADMIN (Database-level, cross-tenant access)
    ↓
OWNER (Full organization access, can create ADMIN)
    ↓
ADMIN (Manage stores, can create STAFF/VIEWER)
    ↓
STAFF (Store-level access via employee_stores)
    ↓
VIEWER (Read-only access)
```

### Guards
- **JwtAuthGuard**: Validates JWT token
- **RoleGuard**: Validates employee role (@Roles decorator)
- **StoreAccessGuard**: Validates store-level access

---

## 🎯 SaaS Features

### Multi-Tenancy
- ✅ Complete data isolation between organizations
- ✅ Organization-scoped queries with automatic filtering
- ✅ Cross-tenant access prevention (404/403 responses)
- ✅ Unique constraints per organization (email, codes, etc.)

### Subscription Plans

| Plan | Employees | Stores | Monthly Appointments |
|------|-----------|--------|---------------------|
| FREE | 5 | 1 | 100 |
| BASIC | 20 | 5 | 1,000 |
| PRO | 100 | 20 | 10,000 |
| ENTERPRISE | Unlimited | Unlimited | Unlimited |

### Dynamic Features
- Features stored in database (not hardcoded)
- Per-store activation with custom limits
- Category-based organization
- Minimum plan requirements per feature

---

## 📂 Project Structure

```
superpet-api/
├── src/
│   ├── auth/                    # Authentication & authorization
│   ├── organizations/           # Multi-tenant organizations
│   ├── users/                   # User management
│   ├── employees/               # Employee & role management
│   ├── stores/                  # Store management & features
│   ├── customers/               # Customer management
│   ├── pets/                    # Pet management
│   ├── services/                # Service catalog & custom services
│   ├── pickups/                 # TelePickup feature
│   ├── live-cam/                # Live camera streaming
│   ├── database/
│   │   ├── migrations/          # TypeORM migrations (14 files)
│   │   └── seeds/               # Database seeders
│   └── common/
│       ├── guards/              # Security guards
│       ├── decorators/          # Custom decorators
│       └── entities/            # Base entities
│
├── test/
│   └── automation/              # Automated test suite
│       ├── auth/                # Auth tests (6)
│       ├── stores/              # Store tests (7)
│       ├── customers/           # Customer tests (8)
│       ├── pets/                # Pet tests (6)
│       ├── services/            # Service tests (7)
│       ├── features/            # Feature tests (7+6)
│       ├── employees/           # Employee tests (10)
│       └── saas/                # SaaS tests (13+4)
│
├── docs/
│   ├── guides/                  # Technical documentation
│   │   ├── ARCHITECTURE.md      # System architecture
│   │   ├── SAAS-RULES.md        # SaaS implementation rules
│   │   ├── IMPLEMENTATION-STATUS.md  # Current implementation status
│   │   ├── api-endpoints.md     # Complete API reference
│   │   ├── environments.md      # Environment setup
│   │   ├── MIGRATIONS.md        # Migration management
│   │   ├── SEED-DATABASE.md     # Database seeding
│   │   ├── PASSWORD-RECOVERY.md # Password recovery flow
│   │   └── SCRIPTS.md           # NPM scripts reference
│   │
│   └── collections/
│       └── postman/             # Postman collections
│
└── env/                         # Environment configurations
    ├── template.env             # Environment template
    ├── local.env                # Local development (gitignored)
    ├── staging.env              # Staging (gitignored)
    └── prod.env                 # Production (gitignored)
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:local              # Start in local mode
npm run start:dev                # Start with watch mode
npm run build                    # Build for production

# Database
npm run typeorm                  # TypeORM CLI
npm run migration:generate       # Generate migration from entities
npm run migration:create         # Create empty migration
npm run migration:run:local      # Run migrations (local)
npm run migration:revert:local   # Revert last migration (local)

# Testing
node test/automation/run-all-tests.js        # Run all 74 tests
node test/automation/auth/auth.test.js       # Run auth tests only
node test/automation/saas/saas-isolation.test.js  # Run SaaS tests

# Database Utilities
node test/automation/setup-superuser.js      # Create SUPER_ADMIN user
node test/automation/update-org-limits.js    # Update organization limits
node test/automation/reset-database.js       # Reset database (careful!)
```

### Environment Configuration

Create your environment file:

```bash
# Windows
Copy-Item env\template.env env\local.env

# Linux/Mac
cp env/template.env env/local.env
```

Required environment variables:

```env
# Server
NODE_ENV=local
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=superpet_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Other services (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 📊 Database Migrations

### Migration Files (14)

1. `CreateOrganizationsTable` - Multi-tenant root
2. `CreateUsersTable` - User base entity
3. `CreateEmployeesTable` - Employee management with roles
4. `CreateEmployeeStoresTable` - Employee-store relationships
5. `CreateStoresTable` - Store/location management
6. `CreateCustomersTable` - Customer management
7. `CreatePersonalDataTable` - PII-protected data
8. `CreateAddressesTable` - Customer addresses
9. `CreatePetsTable` - Pet management
10. `CreateServicesTable` - Service catalog
11. `CreateStoreFeaturesTable` - Store feature configuration
12. `CreateCustomServicesTable` - Store-specific pricing
13. `CreatePickupsTable` - TelePickup feature
14. `CreateLiveCamStreamsTable` - Live camera feature
15. `CreateTokenBlacklistTable` - JWT blacklist
16. `CreateFeaturesTable` - Dynamic feature system

### Migration Commands

```bash
# Run all pending migrations
npm run migration:run:local

# Revert last migration
npm run migration:revert:local

# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Create empty migration
npm run migration:create -- src/database/migrations/MigrationName
```

---

## 🎨 Code Architecture

### Module Structure

Each module follows NestJS best practices:

```
module/
├── entities/              # TypeORM entities
│   ├── entity.entity.ts
│   └── related.entity.ts
├── dto/                   # Data Transfer Objects
│   ├── create.dto.ts
│   └── update.dto.ts
├── repositories/          # Data access layer
│   └── module.repository.ts
├── services/              # Business logic
│   └── module.service.ts
├── guards/                # Authorization guards (if any)
├── module.controller.ts   # HTTP endpoints
└── module.module.ts       # NestJS module definition
```

### Dependency Injection

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity]),
    forwardRef(() => DependentModule), // Circular dependency
  ],
  controllers: [Controller],
  providers: [Service, Repository],
  exports: [Service, Repository],
})
export class MyModule {}
```

---

## 📖 Documentation

### Main Guides
- **[Architecture](./docs/guides/ARCHITECTURE.md)** - Complete system architecture
- **[SaaS Rules](./docs/guides/SAAS-RULES.md)** - Multi-tenancy implementation rules
- **[Implementation Status](./docs/guides/IMPLEMENTATION-STATUS.md)** - Current development status
- **[API Endpoints](./docs/guides/API-ENDPOINTS.md)** - Complete endpoint reference

### Technical Guides
- **[Migrations Guide](./docs/guides/MIGRATIONS-GUIDE.md)** - Complete migration workflow & commands
- **[Error Codes Reference](./docs/guides/ERROR-CODES.md)** - All error codes & handling
- **[Environments](./docs/guides/ENVIRONMENTS.md)** - Environment setup guide
- **[Database Seeding](./docs/guides/SEED-DATABASE.md)** - How to seed the database
- **[Scripts Reference](./docs/guides/SCRIPTS.md)** - All available NPM scripts
- **[Password Recovery](./docs/guides/PASSWORD-RECOVERY.md)** - Password reset flow
- **[Pets & Customers API](./docs/guides/PETS-CUSTOMERS-API.md)** - Detailed module guide

### Postman Collections (64 Endpoints)
- [Auth Collection](./docs/collections/auth/) - 3 endpoints
- [Employees Collection](./docs/collections/employees/) - 10 endpoints
- [Stores Collection](./docs/collections/stores/) - 12 endpoints
- [Customers Collection](./docs/collections/customers/) - 11 endpoints
- [Pets Collection](./docs/collections/pets/) - 7 endpoints
- [Services Collection](./docs/collections/services/) - 13 endpoints
- [Features Collection](./docs/collections/features/) - 8 endpoints

> 📦 **[Collection Index](./docs/collections/README.md)** - Complete guide for all collections

---

## 🚢 Deployment

### Build for Production

```bash
# Build the application
npm run build

# The compiled output will be in the dist/ directory
```

### Production Environment

```bash
# Set environment
export NODE_ENV=production

# Run migrations
npm run migration:run:prod

# Start application
npm run start:prod
```

### Docker Support (Coming Soon)

```bash
# Build image
docker build -t superpet-api .

# Run container
docker-compose up -d
```

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes following existing patterns
3. Run tests: `node test/automation/run-all-tests.js`
4. Ensure all 74 tests pass
5. Create pull request

### Code Style

- Use TypeScript strict mode
- Follow NestJS conventions
- Use DTOs for all inputs/outputs
- Implement proper error handling
- Add JSDoc comments for complex logic

---

## 📝 License

This project is proprietary and confidential.

---

## 👨‍💻 Author

**SuperPet Development Team**

---

## 🎯 Roadmap

### Implemented ✅
- [x] Multi-tenant SaaS architecture
- [x] Role-based access control with 5 roles
- [x] 17 job titles for employees
- [x] Dynamic feature system (10+ features, scalable to 20+)
- [x] Store management with multi-location support
- [x] Customer & pet management
- [x] Service catalog with store-level customization
- [x] Advanced features (TelePickup, Live Camera)
- [x] Plan limits & validation
- [x] 74 automated tests with 100% pass rate

### Coming Soon 🚧
- [ ] Appointment scheduling system
- [ ] Payment processing integration
- [ ] Real-time notifications (WebSocket)
- [ ] Analytics dashboard
- [ ] Mobile app API
- [ ] Docker deployment
- [ ] CI/CD pipeline

---

## 📞 Support

For questions or issues, please contact the development team.

---

<div align="center">

**Built with ❤️ using NestJS, TypeORM & MySQL**

</div>
