# 🚀 Setup Guide

Complete guide for environment setup, scripts, and database seeding.

---

## 📁 Environment Configuration

### Files Location
All environment files are in `env/` folder (gitignored).

### Quick Start

```bash
# 1. Copy template
cp env/template.env env/local.env

# 2. Edit env/local.env with your database credentials

# 3. Run migrations
npm run database:migration:run:local

# 4. Seed database
npm run database:seed

# 5. Start API
npm run start:local
```

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=superpet_db

# JWT (generate strong secrets for staging/prod)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# Server
PORT=3000
NODE_ENV=local|staging|production
```

**⚠️  Security:**
- Use strong secrets in staging/production
- Never commit `.env` files
- Rotate secrets regularly

---

## 📜 NPM Scripts Reference

### Development

```bash
npm run start:local        # Start with hot-reload
npm run start:local:debug  # Start with debugger
npm run build              # Build for production
```

### Migrations

```bash
# Create empty migration
npm run database:migration:create src/database/migrations/Name

# Generate from entities
npm run database:migration:generate:local src/database/migrations/Name

# Run migrations
npm run database:migration:run:local
npm run database:migration:run:staging
npm run database:migration:run:production

# Revert last migration
npm run database:migration:revert:local

# Show migration status
npm run database:migration:status:local
```

### Database

```bash
npm run database:seed         # Seed with test data (local)

npm run database:schema:drop  # ⚠️  Drop all tables
npm run database:schema:sync  # ⚠️  Sync schema (dev only)
```

### Testing

```bash
npm run test:unit          # Unit tests
npm run test:e2e           # E2E tests
npm run test:coverage      # Coverage report

# Automation tests (134 tests)
npm run test:automation:all
npm run test:automation:from-scratch
npm run test:database:reset
```

### Code Quality

```bash
npm run lint:fix           # Run ESLint with fix
npm run format:code        # Run Prettier
```

---

## 🌱 Database Seeding

### What Gets Seeded

| Resource | Count | Description |
|----------|-------|-------------|
| **Organization** | 1 | SuperPet main org |
| **Stores** | 43 | Multi-location stores |
| **Features** | 10+ | Dynamic features |
| **Services** | 38 | Service catalog |
| **Employees** | 200+ | Test employees |
| **Customers** | 5 | Test customers |

### Run Seed

```bash
# Local environment
npm run database:seed
```

**Output:**
```
✅ Organizations seeded (1)
✅ Stores seeded (43)
✅ Features seeded (10)
✅ Services seeded (38)
✅ SEED COMPLETED!
```

### Seed Files

Located in `src/database/seeds/`:
- `01-organization.seed.ts` - Organizations
- `02-stores.seed.ts` - Stores
- `03-services.seed.ts` - Services catalog
- `features.seed.ts` - Dynamic features
- `run-seed.ts` - Main orchestrator

### Re-seeding

```bash
# Drop and recreate
npm run database:schema:drop
npm run database:migration:run:local
npm run database:seed
```

**⚠️  Warning:** `database:schema:drop` deletes ALL data!

---

## 🔄 Common Workflows

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp env/template.env env/local.env
# Edit env/local.env

# 3. Create database
mysql -u root -p
CREATE DATABASE superpet_db;
exit

# 4. Run migrations
npm run database:migration:run:local

# 5. Seed data
npm run database:seed

# 6. Start server
npm run start:local

# 7. Test
curl http://localhost:3000
# Should return: "Hello World!"
```

### Daily Development

```bash
# Start API
npm run start:local

# In another terminal: Run tests
npm run test:automation:all
```

### Before Deployment

```bash
# Build
npm run build

# Test build
npm run start:staging

# Check logs for errors
```

### Migration Workflow

```bash
# 1. Create entity in src/*/entities/

# 2. Generate migration
npm run database:migration:generate:local src/database/migrations/AddNewTable

# 3. Review generated migration

# 4. Run migration
npm run database:migration:run:local

# 5. Test
npm run start:local
```

---

## 🐳 Docker Setup (Optional)

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: superpet_db
    ports:
      - "3306:3306"
  
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      DB_HOST: db
```

### Commands

```bash
docker-compose up -d        # Start
docker-compose logs -f api  # View logs
docker-compose down         # Stop
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `npm run start:local` starts without errors
- [ ] Database connection established
- [ ] http://localhost:3000 returns "Hello World!"
- [ ] http://localhost:3000/auth/me returns 401 (expected)
- [ ] `npm run test:automation:all` passes 134 tests

---

## 🆘 Troubleshooting

### Database Connection Failed

```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in env/local.env
DB_USERNAME=root
DB_PASSWORD=root

# Test connection
mysql -u root -p superpet_db
```

### Migration Errors

```bash
# Check migration status
npm run database:migration:status:local

# If stuck, revert and retry
npm run database:migration:revert:local
npm run database:migration:run:local
```

### Port Already in Use

```bash
# Change port in env/local.env
PORT=3001

# Or kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Seed Fails

```bash
# Reset database
npm run database:schema:drop
npm run database:migration:run:local
npm run database:seed
```

---

## 📚 Next Steps

- See [DATABASE.md](./DATABASE.md) for migrations and entities
- See [API.md](./API.md) for endpoint reference
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See [ERRORS.md](./ERRORS.md) for error handling

---

**✨ Setup complete! You're ready to develop!**

