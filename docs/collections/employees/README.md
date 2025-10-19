# SuperPet - Employees & Roles Collection

Postman collection for employee management with role hierarchy and job titles.

## 📦 Import Collection

1. Open Postman
2. Click **Import**
3. Select `SuperPet-Employees.postman_collection.json`
4. Collection will be imported with all requests

## 🔑 Setup

### 1. Set Variables

After importing, set the collection variables:

- `base_url`: `http://localhost:3000`
- `access_token`: `Bearer YOUR_JWT_TOKEN`
- `store_id`: UUID of an existing store
- `employee_id`: Will be set automatically after creating employee

### 2. Get Access Token

Run the **Auth** collection first to get your JWT token:
1. Register or Login
2. Copy the `access_token` from response
3. Set it in collection variables

## 📋 Requests

### Employee Management (10 requests)

1. **Create Employee (OWNER creates ADMIN)**
   - Creates new employee with ADMIN role
   - Assigns MANAGER job title
   - Links to stores

2. **Create Employee (STAFF - Groomer)**
   - Creates STAFF employee
   - Assigns GROOMER job title

3. **Create Employee (Veterinarian)**
   - Creates STAFF employee
   - Assigns VETERINARIAN job title

4. **List All Employees**
   - Returns all employees in organization

5. **List Employees by Role (STAFF)**
   - Filter employees by role
   - Query param: `?role=STAFF`

6. **List Employees by JobTitle (GROOMER)**
   - Filter employees by job title
   - Query param: `?jobTitle=GROOMER`

7. **List Employees by Store**
   - Filter employees linked to specific store
   - Query param: `?storeId=UUID`

8. **Get Employee by ID**
   - Returns employee details with stores

9. **Update Employee**
   - Update role, job title, or store assignments

10. **Deactivate Employee**
    - Soft delete by setting `active=false`

## 👥 Role Hierarchy

```
SUPER_ADMIN (Database level - cross-tenant)
    ↓
OWNER (Can create: ADMIN, STAFF, VIEWER)
    ↓
ADMIN (Can create: STAFF, VIEWER)
    ↓
STAFF (Store-level access)
    ↓
VIEWER (Read-only)
```

## 💼 Job Titles (17 Types)

- **Management**: OWNER, MANAGER
- **Customer Service**: RECEPTIONIST, CUSTOMER_SERVICE
- **Veterinary**: VETERINARIAN, VET_ASSISTANT
- **Grooming**: GROOMER, GROOMER_ASSISTANT, BATHER
- **Pet Care**: PET_HANDLER, DAYCARE_MONITOR
- **Operations**: JANITOR, STOCK_MANAGER, DELIVERY_DRIVER
- **Specialized**: TRAINER, NUTRITIONIST
- **Other**: OTHER

## ⚠️ Validation

- Email must be unique per organization
- Role hierarchy enforced (ADMIN cannot create OWNER)
- Plan limits enforced (max employees per plan)
- Store IDs must exist in organization

## 🔗 Related Collections

- [Auth Collection](../auth/) - Get access token
- [Stores Collection](../stores/) - Manage stores for employee assignment

