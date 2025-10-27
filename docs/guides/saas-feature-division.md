# SaaS Feature Division System

## Visão Geral

O sistema SuperPet implementa um sofisticado mecanismo de divisão de features entre **STORE** (loja) e **CUSTOMER** (cliente), permitindo que lojas possam escolher quais features estão disponíveis apenas para funcionários ou também para clientes.

## Conceitos

### Features Divisíveis

Uma feature divisível pode ser habilitada de duas formas:

1. **STORE_ONLY**: Apenas funcionários da loja podem acessar
2. **STORE_AND_CUSTOMER**: Funcionários e clientes podem acessar

### Features Não-Divisíveis

Algumas features são apenas para loja (ex: REPORTS_DASHBOARD, ADMIN_PANEL) e não podem ser divididas.

## Como Funciona

### 1. Estrutura do Banco de Dados

```sql
-- Tabela de features
CREATE TABLE features (
  id VARCHAR(36) PRIMARY KEY,
  `key` VARCHAR(50) UNIQUE,
  name VARCHAR(100),
  divisible BOOLEAN DEFAULT FALSE  -- Indica se a feature pode ser dividida
);

-- Tabela store_features com access_type
CREATE TABLE store_features (
  id VARCHAR(36) PRIMARY KEY,
  store_id VARCHAR(36),
  feature_key VARCHAR(50),
  access_type ENUM('STORE', 'CUSTOMER'),  -- Tipo de acesso
  enabled BOOLEAN DEFAULT TRUE,
  limits JSON,
  ...
);
```

### 2. Habilitando uma Feature Divisível

Quando uma feature divisível é habilitada com `customerLimits`, o sistema cria **duas entradas**:

```json
{
  "featureKey": "SERVICE_CATALOG",
  "enabled": true,
  "storeLimits": {
    "maxServicesPerDay": 50
  },
  "customerLimits": {
    "allowSelfService": true,
    "requireApproval": false,
    "maxDailyUsage": 5
  }
}
```

**Resultado no banco:**
- `feature_key: "SERVICE_CATALOG"`, `access_type: "STORE"` (para funcionários)
- `feature_key: "SERVICE_CATALOG"`, `access_type: "CUSTOMER"` (para clientes)

### 3. Habilitando uma Feature Não-Divisível

Quando uma feature **não-divisível** é habilitada, apenas uma entrada é criada:

```json
{
  "featureKey": "REPORTS_DASHBOARD",
  "enabled": true,
  "storeLimits": {
    "maxReportsPerMonth": 100
  }
}
```

**Resultado no banco:**
- `feature_key: "REPORTS_DASHBOARD"`, `access_type: "STORE"` (apenas para funcionários)

## API Endpoints

### 1. Listar Features da Loja (STORE)

```http
GET /stores/{storeId}/features
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "featureKey": "SERVICE_CATALOG",
    "accessType": "STORE",
    "enabled": true,
    "limits": { "maxServicesPerDay": 50 }
  },
  {
    "featureKey": "REPORTS_DASHBOARD",
    "accessType": "STORE",
    "enabled": true,
    "limits": { "maxReportsPerMonth": 100 }
  }
]
```

### 2. Listar Features do Cliente (CUSTOMER)

```http
GET /stores/{storeId}/features/customer
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "featureKey": "SERVICE_CATALOG",
    "accessType": "CUSTOMER",
    "enabled": true,
    "limits": {
      "allowSelfService": true,
      "requireApproval": false,
      "maxDailyUsage": 5
    }
  }
]
```

### 3. Habilitar Feature com Divisão STORE/CUSTOMER

```http
POST /stores/{storeId}/features
Authorization: Bearer {token}
Content-Type: application/json

{
  "featureKey": "ONLINE_BOOKING",
  "enabled": true,
  "storeLimits": {
    "maxBookingsPerDay": 100
  },
  "customerLimits": {
    "allowSelfService": true,
    "requireApproval": false,
    "maxAppointmentsPerDay": 3
  }
}
```

### 4. Atualizar Feature

```http
PUT /stores/{storeId}/features/{featureKey}
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": true,
  "storeLimits": {
    "maxBookingsPerDay": 150
  },
  "customerLimits": {
    "allowSelfService": true,
    "requireApproval": false,
    "maxAppointmentsPerDay": 5
  }
}
```

### 5. Desabilitar Feature

```http
PUT /stores/{storeId}/features/{featureKey}
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": false
}
```

**Nota:** Quando uma feature divisível é desabilitada, ambas as entradas (STORE e CUSTOMER) são removidas.

## Exemplos de Uso

### Cenário 1: Telepickup para Loja + Cliente

Um pet shop quer permitir que clientes agendem telepickup sem aprovação da loja:

```bash
curl -X POST http://localhost:3000/stores/{storeId}/features \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "featureKey": "TELEPICKUP",
    "enabled": true,
    "storeLimits": {
      "dailyPickups": 50
    },
    "customerLimits": {
      "allowSelfService": true,
      "requireApproval": false,
      "maxDailyUsage": 3
    }
  }'
```

**Resultado:**
- Funcionários podem gerenciar até 50 telepickups por dia
- Clientes podem agendar até 3 telepickups por dia sem aprovação

### Cenário 2: Live Cam Apenas para Loja

Uma loja quer usar Live Cam apenas para monitoramento interno:

```bash
curl -X POST http://localhost:3000/stores/{storeId}/features \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "featureKey": "LIVE_CAM",
    "enabled": true,
    "storeLimits": {
      "maxConcurrentStreams": 4
    }
  }'
```

**Resultado:**
- Apenas funcionários podem acessar Live Cam
- Máximo de 4 streams simultâneas

### Cenário 3: Inventory Management para Loja + Cliente

Uma loja permite que clientes façam pedidos de produtos:

```bash
curl -X POST http://localhost:3000/stores/{storeId}/features \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "featureKey": "INVENTORY_MANAGEMENT",
    "enabled": true,
    "storeLimits": {
      "maxProducts": 1000,
      "alertOnLowStock": true
    },
    "customerLimits": {
      "allowOrders": true,
      "requireApproval": true,
      "maxOrdersPerDay": 5
    }
  }'
```

**Resultado:**
- Funcionários podem gerenciar inventário com até 1000 produtos
- Clientes podem fazer pedidos (requer aprovação da loja)
- Máximo de 5 pedidos por cliente por dia

## Validação de Acesso

### No Backend (Guards)

O sistema valida o acesso a features usando guards:

```typescript
@RequireFeature('SERVICE_CATALOG', 'CUSTOMER')
@Get('services')
async getCustomerServices() {
  // Cliente tem acesso a esta feature
}

@RequireFeature('REPORTS_DASHBOARD', 'STORE')
@Get('reports')
async getReports() {
  // Apenas funcionários têm acesso
}
```

### No Frontend

O frontend pode consultar as features disponíveis e condicionar a exibição de elementos:

```javascript
// Buscar features do cliente
const customerFeatures = await fetch(`/stores/${storeId}/features/customer`);

// Verificar se feature está habilitada
const canUseSelfService = customerFeatures
  .find(f => f.featureKey === 'ONLINE_BOOKING')
  ?.limits?.allowSelfService;
```

## Benefícios

1. **Flexibilidade**: Lojas podem escolher como expor features
2. **Segurança**: Controle granular de acesso por tipo de usuário
3. **Escalabilidade**: Sistema preparado para crescimento
4. **Customização**: Limites diferentes para loja e cliente
5. **SaaS Ready**: Funciona perfeitamente com multi-tenancy

## Limitações Conhecidas

- Features não-divisíveis não podem ser habilitadas para clientes
- A remoção de uma feature remove ambas as entradas (STORE e CUSTOMER)
- A alteração de `customerLimits` requer a atualização explícita via PUT

## Testes

Execute todos os testes de SaaS:

```bash
npm run test:automation:all
```

Ou testes específicos de divisão de features:

```bash
node test/automation/features/saas-division.test.js
```

