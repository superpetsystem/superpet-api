# SuperPet - Online Booking Collection

Collection para gerenciamento de agendamentos online.

## 📋 Endpoints (6)

### Bookings
1. **POST** `/v1/bookings` - Criar agendamento
2. **GET** `/v1/bookings/stores/:storeId` - Listar agendamentos da loja
3. **GET** `/v1/bookings/customers/:customerId` - Listar agendamentos do cliente
4. **PATCH** `/v1/bookings/:id/confirm` - Confirmar agendamento
5. **PATCH** `/v1/bookings/:id/complete` - Completar agendamento
6. **PATCH** `/v1/bookings/:id/cancel` - Cancelar agendamento

## ✅ Requisitos

**Feature:** ONLINE_BOOKING deve estar habilitada na loja

**Para habilitar:**
```bash
# Via SUPER_ADMIN
POST /v1/admin/stores/{storeId}/features/ONLINE_BOOKING
{
  "enabled": true,
  "limits": {
    "maxBookingsPerDay": 100
  }
}
```

## 🔄 Fluxo de Status

```
PENDING → CONFIRMED → COMPLETED
   ↓
CANCELLED (a qualquer momento)
```

## 📝 Exemplo Completo

```bash
# 1. Criar agendamento
POST /v1/bookings
{
  "storeId": "uuid",
  "customerId": "uuid",
  "petId": "uuid",
  "serviceId": "uuid",
  "bookingDate": "2025-10-25",
  "startTime": "10:00",
  "notes": "Primeira vez do pet"
}

# 2. Confirmar
PATCH /v1/bookings/{id}/confirm

# 3. Completar
PATCH /v1/bookings/{id}/complete

# Ou cancelar
PATCH /v1/bookings/{id}/cancel
{
  "reason": "Cliente desmarcou"
}
```

## 🎯 Validações

- ✅ Data não pode ser no passado
- ✅ Não pode haver conflito de horário
- ✅ Service deve existir
- ✅ Customer e Pet devem existir
- ✅ Store deve ter feature habilitada
- ✅ Horário deve estar dentro do expediente

## 📊 Filtros Disponíveis

**List Store Bookings:**
- `date`: Filtrar por data (YYYY-MM-DD)
- `status`: PENDING, CONFIRMED, COMPLETED, CANCELLED

## 📦 Variáveis

- `base_url`: http://localhost:3000
- `access_token`: Token JWT
- `store_id`: ID da loja
- `customer_id`: ID do cliente
- `pet_id`: ID do pet
- `service_id`: ID do serviço
- `booking_id`: ID do agendamento criado

