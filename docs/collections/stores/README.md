# SuperPet - Stores & Features Collection

Postman collection for store management and dynamic feature configuration.

## 📦 Import Collection

1. Open Postman
2. Click **Import**
3. Select `SuperPet-Stores.postman_collection.json`
4. Collection will be imported with all requests

## 🔑 Setup

### Set Variables

- `base_url`: `http://localhost:3000`
- `access_token`: `Bearer YOUR_JWT_TOKEN` (from Auth collection)
- `store_id`: Will be set after creating store

## 📋 Requests

### Store Management (4 requests)

1. **Create Store**
   - Create new store/location
   - Set timezone, opening hours, capacity

2. **List All Stores**
   - Returns all stores in organization

3. **Get Store by ID**
   - Returns store details with features

4. **Update Store**
   - Update name, hours, capacity

### Store Features (4 requests)

5. **List Store Features**
   - Shows all available features for store

6. **Enable Feature (TELEPICKUP)**
   - Enable TelePickup with custom limits
   - Example: `dailyPickups: 50`

7. **Enable Feature (LIVE_CAM)**
   - Enable Live Camera with limits
   - Example: `maxConcurrentStreams: 10`

8. **Disable Feature**
   - Disable any feature for the store

## 🎯 Available Features

| Feature | Description | Default Limits |
|---------|-------------|----------------|
| **SERVICE_CATALOG** | Service catalog management | - |
| **CUSTOM_SERVICE** | Store-specific pricing | - |
| **TELEPICKUP** | Pet pickup scheduling | `dailyPickups: 100` |
| **LIVE_CAM** | Live camera streaming | `maxConcurrentStreams: 5` |
| **ONLINE_BOOKING** | Online appointment booking | `maxConcurrent: 100` |
| **PET_HOTEL** | Pet hotel management | - |
| **LOYALTY_PROGRAM** | Customer loyalty points | - |

## ⚠️ Validation

- Store code must be unique per organization
- Timezone must be valid (e.g., `America/Manaus`)
- Opening hours format: `[[\"HH:MM\", \"HH:MM\"]]`
- Feature keys must exist in features table
- Plan limits enforced (max stores per plan)

## 🔗 Related Collections

- [Auth Collection](../auth/) - Get access token
- [Features Collection](../features/) - Use enabled features
- [Services Collection](../services/) - Configure services

