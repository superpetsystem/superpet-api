# 📚 Feature Access System - API Documentation

## 🎯 Overview

O sistema de Feature Access permite configurar quais features estão disponíveis para clientes em cada loja, criando um SaaS escalável onde cada loja pode escolher entre "apenas loja" ou "loja + cliente".

---

## 🏗️ Architecture

### **Entidades Principais**

```typescript
// Feature Access por Loja
interface StoreFeatureAccess {
  id: string;
  storeId: string;
  featureKey: string;
  accessType: 'STORE_ONLY' | 'STORE_AND_CUSTOMER';
  customerAccessConfig?: CustomerAccessConfig;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Configuração de Acesso do Cliente
interface CustomerAccessConfig {
  allowSelfRegistration?: boolean;     // Cliente pode se cadastrar
  allowSelfService?: boolean;          // Cliente pode usar self-service
  requireApproval?: boolean;           // Requer aprovação da loja
  maxDailyUsage?: number;             // Máximo de uso por dia
  allowedCustomerRoles?: string[];     // Roles de cliente permitidas
  customLimits?: any;                 // Limites customizados
}
```

---

## 🔧 API Endpoints

### **Base URL**: `/stores/{storeId}/feature-access`

### **1. Listar Features Configuradas**
```http
GET /stores/{storeId}/feature-access
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "storeId": "uuid",
    "featureKey": "ONLINE_BOOKING",
    "accessType": "STORE_AND_CUSTOMER",
    "customerAccessConfig": {
      "allowSelfService": true,
      "requireApproval": false,
      "maxBookingsPerDay": 5
    },
    "enabled": true,
    "feature": {
      "name": "Agendamento Online",
      "description": "Permite que clientes agendem serviços online"
    }
  }
]
```

### **2. Listar Features Disponíveis para Clientes**
```http
GET /stores/{storeId}/feature-access/customer-available
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "featureKey": "ONLINE_BOOKING",
    "accessType": "STORE_AND_CUSTOMER",
    "customerAccessConfig": {
      "allowSelfService": true,
      "maxBookingsPerDay": 5
    },
    "feature": {
      "name": "Agendamento Online",
      "description": "Permite que clientes agendem serviços online"
    }
  }
]
```

### **3. Listar Features Divisíveis**
```http
GET /stores/{storeId}/feature-access/divisible
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "key": "CUSTOMER_REGISTRATION",
    "name": "Cadastro de Clientes",
    "description": "Permite que clientes se cadastrem no sistema",
    "category": "CUSTOMER",
    "minPlanRequired": "FREE",
    "metadata": {
      "icon": "user-plus",
      "color": "#10B981",
      "divisible": true
    }
  }
]
```

### **4. Configurar Acesso de Feature**
```http
POST /stores/{storeId}/feature-access/{featureKey}
Authorization: Bearer {token}
Content-Type: application/json

{
  "accessType": "STORE_AND_CUSTOMER",
  "customerConfig": {
    "allowSelfService": true,
    "requireApproval": false,
    "maxBookingsPerDay": 5
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "storeId": "uuid",
  "featureKey": "ONLINE_BOOKING",
  "accessType": "STORE_AND_CUSTOMER",
  "customerAccessConfig": {
    "allowSelfService": true,
    "requireApproval": false,
    "maxBookingsPerDay": 5
  },
  "enabled": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **5. Atualizar Configuração de Feature**
```http
PUT /stores/{storeId}/feature-access/{featureKey}
Authorization: Bearer {token}
Content-Type: application/json

{
  "accessType": "STORE_AND_CUSTOMER",
  "customerConfig": {
    "allowSelfService": true,
    "requireApproval": true,
    "maxBookingsPerDay": 3
  },
  "enabled": true
}
```

### **6. Habilitar Feature**
```http
POST /stores/{storeId}/feature-access/{featureKey}/enable
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Feature enabled successfully"
}
```

### **7. Desabilitar Feature**
```http
POST /stores/{storeId}/feature-access/{featureKey}/disable
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Feature disabled successfully"
}
```

### **8. Obter Configuração de Feature**
```http
GET /stores/{storeId}/feature-access/{featureKey}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "featureKey": "ONLINE_BOOKING",
  "storeId": "uuid",
  "isAvailableForCustomers": true,
  "customerConfig": {
    "allowSelfService": true,
    "requireApproval": false,
    "maxBookingsPerDay": 5
  }
}
```

---

## 🛡️ Customer Portal Endpoints

### **Base URL**: `/customer-portal/stores/{storeId}`

### **1. Listar Features Disponíveis**
```http
GET /customer-portal/stores/{storeId}/available-features
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "key": "ONLINE_BOOKING",
    "name": "Agendamento Online",
    "description": "Permite que clientes agendem serviços online",
    "customerConfig": {
      "allowSelfService": true,
      "maxBookingsPerDay": 5
    }
  }
]
```

### **2. Endpoints Protegidos por Feature**

Todos os endpoints do customer portal são protegidos pelo `CustomerAccessGuard`:

```typescript
@Get('bookings')
@UseGuards(CustomerAccessGuard)
@RequireCustomerAccess('ONLINE_BOOKING')
async getMyBookings(@Param('storeId') storeId: string) {
  // Só funciona se ONLINE_BOOKING estiver habilitado para clientes
}
```

---

## 🎯 Configurações Pré-definidas

### **Loja Básica (Apenas Loja)**
```typescript
const basicFeatures = [
  'SERVICE_CATALOG',
  'PRODUCT_CATALOG', 
  'VETERINARY_RECORDS',
  'VACCINATION_RECORDS',
  'GROOMING_NOTES',
];

// Todas configuradas como STORE_ONLY
```

### **Loja Intermediária (Loja + Cliente Limitado)**
```typescript
const customerFeatures = [
  {
    key: 'CUSTOMER_REGISTRATION',
    config: { allowSelfRegistration: true, requireApproval: false },
  },
  {
    key: 'ONLINE_BOOKING',
    config: { allowSelfService: true, requireApproval: true, maxBookingsPerDay: 3 },
  },
  {
    key: 'SERVICE_CATALOG',
    config: { allowSelfService: true, showPricing: true },
  },
];
```

### **Loja Premium (Loja + Cliente Completo)**
```typescript
const premiumFeatures = [
  {
    key: 'ONLINE_BOOKING',
    config: { allowSelfService: true, requireApproval: false, maxBookingsPerDay: 10 },
  },
  {
    key: 'LIVE_CAM',
    config: { allowSelfService: true, maxConcurrentStreams: 5, maxDailyMinutes: 120 },
  },
  {
    key: 'ONLINE_PAYMENTS',
    config: { allowSelfService: true, supportedMethods: ['PIX', 'CARD', 'BOLETO'] },
  },
];
```

---

## 🔒 Guards e Segurança

### **CustomerAccessGuard**
```typescript
@Injectable()
export class CustomerAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureKey = this.reflector.get<string>('customer-access-feature', context.getHandler());
    const storeId = this.extractStoreId(request);
    
    const isAvailable = await this.featureAccessService.isFeatureAvailableForCustomers(
      storeId,
      featureKey,
    );

    if (!isAvailable) {
      throw new ForbiddenException(`Feature ${featureKey} is not available for customers`);
    }

    return true;
  }
}
```

### **Decorator @RequireCustomerAccess**
```typescript
export const RequireCustomerAccess = (featureKey: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflector.defineMetadata('customer-access-feature', featureKey, descriptor.value);
  };
};
```

---

## 📊 Features Divisíveis Disponíveis

### **CUSTOMER (5 features)**
- `CUSTOMER_REGISTRATION` - Cadastro de Clientes
- `PET_REGISTRATION` - Cadastro de Pets  
- `CUSTOMER_PORTAL` - Portal do Cliente
- `LOYALTY_PROGRAM` - Programa de Fidelidade
- `CUSTOMER_REVIEWS` - Avaliações/NPS

### **SERVICES (4 features)**
- `ONLINE_BOOKING` - Agendamento Online
- `SERVICE_CATALOG` - Catálogo de Serviços
- `PRODUCT_CATALOG` - Catálogo de Produtos
- `HOTEL_RESERVATIONS` - Reservas de Hotel/Creche

### **OPERATIONS (4 features)**
- `TELEPICKUP` - Tele-busca
- `ONLINE_PAYMENTS` - Pagamentos Online
- `SUBSCRIPTIONS` - Assinaturas
- `DELIVERY_SERVICE` - Entrega/Retirada

### **CUSTOMER (4 features)**
- `VACCINATION_RECORDS` - Ficha de Vacinação
- `VETERINARY_RECORDS` - Prontuário Veterinário
- `LIVE_CAM` - Live Cam
- `GROOMING_NOTES` - Grooming Notes + Fotos

### **CUSTOMER (4 features)**
- `DIGITAL_CARD` - Carteirinha Digital
- `MEDICAL_RECORDS` - Exames e Laudos
- `MARKETING_AUTOMATION` - Automações de Marketing
- `COUPONS_GIFT_CARDS` - Cupons/Gift Cards

### **SERVICES (3 features)**
- `DYNAMIC_PRICING` - Preço Dinâmico
- `DIGITAL_SIGNATURE` - Assinatura Digital
- `CUSTOMER_APP` - App/Portal do Tutor

### **CUSTOMER (4 features)**
- `TELEMEDICINE` - Telemedicina
- `NUTRITIONAL_CATALOG` - Catálogo Nutricional
- `ENVIRONMENTAL_ENRICHMENT` - Enriquecimento Ambiental
- `REPUTATION_MANAGEMENT` - Gestão de Reputação

### **SERVICES (1 feature)**
- `OMNICHANNEL_CATALOG` - Catálogo Omnichannel

---

## 🚀 Exemplos de Uso

### **1. Configurar Loja Básica**
```bash
# Configurar features como STORE_ONLY
curl -X POST "http://localhost:3000/stores/{storeId}/feature-access/SERVICE_CATALOG" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"accessType": "STORE_ONLY"}'
```

### **2. Habilitar Agendamento para Clientes**
```bash
curl -X POST "http://localhost:3000/stores/{storeId}/feature-access/ONLINE_BOOKING" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "accessType": "STORE_AND_CUSTOMER",
    "customerConfig": {
      "allowSelfService": true,
      "requireApproval": false,
      "maxBookingsPerDay": 5
    }
  }'
```

### **3. Verificar Features Disponíveis para Clientes**
```bash
curl -X GET "http://localhost:3000/stores/{storeId}/feature-access/customer-available" \
  -H "Authorization: Bearer {token}"
```

### **4. Acessar Endpoint de Cliente**
```bash
curl -X GET "http://localhost:3000/customer-portal/stores/{storeId}/bookings" \
  -H "Authorization: Bearer {token}" \
  -G -d "customerId=test-customer-id"
```

---

## ⚠️ Considerações Importantes

1. **Segurança**: Todos os endpoints requerem autenticação
2. **Permissões**: Apenas OWNER e ADMIN podem configurar features
3. **Validação**: Features devem existir no sistema antes de serem configuradas
4. **Isolamento**: Cada loja tem configuração independente
5. **Auditoria**: Todas as mudanças são logadas com timestamps

---

## 🔄 Migração e Evolução

### **Migrar de "Apenas Loja" para "Loja + Cliente"**
```typescript
// 1. Configurar features como STORE_AND_CUSTOMER
await featureAccessService.configureFeatureAccess(
  storeId,
  'ONLINE_BOOKING',
  FeatureAccessType.STORE_AND_CUSTOMER,
  { allowSelfService: true, requireApproval: true }
);

// 2. Gradualmente remover requireApproval
await featureAccessService.configureFeatureAccess(
  storeId,
  'ONLINE_BOOKING',
  FeatureAccessType.STORE_AND_CUSTOMER,
  { allowSelfService: true, requireApproval: false }
);
```

### **Configuração Dinâmica**
```typescript
// Baseado no plano da organização
if (organization.plan === 'PREMIUM') {
  await storeConfig.setupPremiumStore(storeId);
} else if (organization.plan === 'BASIC') {
  await storeConfig.setupCustomerEnabledStore(storeId);
} else {
  await storeConfig.setupBasicStore(storeId);
}
```
