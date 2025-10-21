# SuperPet - Advanced Features Collection

Postman collection for TelePickup and Live Camera features.

## 📦 Import Collection

1. Open Postman
2. Click **Import**
3. Select `SuperPet-Features.postman_collection.json`
4. Collection will be imported with all requests

## 🔑 Setup

### Set Variables

- `base_url`: `http://localhost:3000`
- `access_token`: `Bearer YOUR_JWT_TOKEN`
- `store_id`: UUID of store with features enabled
- `customer_id`: UUID of customer
- `pet_id`: UUID of pet
- `pickup_id`: Set after scheduling pickup
- `stream_id`: Set after creating stream

### Enable Features First

Before using these endpoints, enable the features in your store:

```http
PUT /v1/stores/{{store_id}}/features/TELEPICKUP
{
  "enabled": true,
  "limits": { "dailyPickups": 50 }
}

PUT /v1/stores/{{store_id}}/features/LIVE_CAM
{
  "enabled": true,
  "limits": { "maxConcurrentStreams": 10 }
}
```

## 📋 Requests

### TelePickup (5 requests)

1. **Schedule Pickup**
   - Request pet pickup with time window
   - Window must be at least 30 minutes

2. **List Pickups (Today)**
   - Filter by date
   - Returns all pickups for the store

3. **Confirm Pickup**
   - Change status to CONFIRMED
   - Customer will be notified

4. **Complete Pickup**
   - Mark pickup as COMPLETED
   - Updates timestamp

5. **Cancel Pickup**
   - Cancel scheduled pickup
   - Status becomes CANCELLED

### Live Camera (3 requests)

6. **Create Live Stream**
   - Start new stream for a pet
   - Set expiration time

7. **Get Pet Streams (Customer View)**
   - Customer endpoint to view their pet
   - Returns only ONLINE streams

8. **Delete Stream**
   - Stop stream and clean up

## 🚚 TelePickup States

```
PENDING → CONFIRMED → COMPLETED
   ↓
CANCELLED
```

## 📹 Live Stream States

```
ONLINE → OFFLINE (expired or manually stopped)
```

## ⚠️ Validation

### TelePickup
- Window must be at least 30 minutes
- `windowStart < windowEnd`
- Pet must belong to customer
- Feature must be enabled in store
- Daily limit enforced

### Live Camera
- Stream URL must be valid
- Expiration time required
- Only ONLINE streams visible to customers
- Concurrent stream limit enforced

## 🔗 Related Collections

- [Auth Collection](../auth/) - Get access token
- [Stores Collection](../stores/) - Enable features
- [Pets Collection](../pets/) - Get pet IDs
- [Customers Collection](../customers/) - Get customer IDs

