# SuperPet - Services & Custom Pricing Collection

Postman collection for service catalog and store-specific pricing management.

## 📦 Import Collection

1. Open Postman
2. Click **Import**
3. Select `SuperPet-Services.postman_collection.json`
4. Collection will be imported with all requests

## 🔑 Setup

### Set Variables

- `base_url`: `http://localhost:3000`
- `access_token`: `Bearer YOUR_JWT_TOKEN`
- `store_id`: UUID of store for custom pricing
- `service_id`: Will be set after creating service
- `custom_service_id`: Will be set after creating custom service

## 📋 Requests

### Services Catalog (4 requests)

1. **Create Service**
   - Create global service in catalog
   - Set base price, duration, resources

2. **List All Services**
   - Returns all services in organization

3. **Get Service by ID**
   - Returns service details

4. **Update Service**
   - Update name, price, duration

### Custom Services - Store Pricing (4 requests)

5. **Create Custom Service (DRAFT)**
   - Override pricing for specific store
   - Starts in DRAFT state

6. **Publish Custom Service**
   - Activate custom pricing
   - Changes state to PUBLISHED

7. **List Store Custom Services**
   - Returns all custom services for store

8. **Archive Custom Service**
   - Deactivate custom pricing
   - Store reverts to base pricing

## 💡 Service Lifecycle

```
1. Create Service (Global Catalog)
   └─> Base price: R$ 80.00
   
2. Create Custom Service (Store Override)
   └─> State: DRAFT
   └─> Override price: R$ 75.00
   
3. Publish Custom Service
   └─> State: PUBLISHED
   └─> Store now charges R$ 75.00
   
4. Archive Custom Service
   └─> State: ARCHIVED
   └─> Store reverts to R$ 80.00
```

## 📊 Service Properties

```json
{
  "code": "BANHO-COMPLETO",
  "name": "Banho Completo",
  "description": "Banho completo com shampoo premium",
  "durationMinutes": 60,
  "bufferBefore": 10,       // Setup time
  "bufferAfter": 10,        // Cleanup time
  "resourcesRequired": ["GROOMER", "BATHER"],
  "visibility": "PUBLIC",   // PUBLIC | INTERNAL
  "priceBaseCents": 8000,   // R$ 80.00
  "taxCode": "SERV_001"
}
```

## ⚠️ Validation

- Service code must be unique per organization
- Duration minimum: 1 minute
- Price minimum: 0 cents
- Resources must exist in catalog
- Visibility: PUBLIC or INTERNAL

## 🔗 Related Collections

- [Auth Collection](../auth/) - Get access token
- [Stores Collection](../stores/) - Manage stores

