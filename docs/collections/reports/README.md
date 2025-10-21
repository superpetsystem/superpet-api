# SuperPet - Reports & Analytics Collection

Collection para relatórios gerenciais e business intelligence.

## 📋 Endpoints (4)

1. **GET** `/v1/reports/dashboard` - Dashboard geral com KPIs
2. **GET** `/v1/reports/customers` - Analytics de clientes
3. **GET** `/v1/reports/pets` - Estatísticas de pets
4. **GET** `/v1/reports/stores/:storeId/performance` - Performance da loja

## ✅ Requisitos

**Feature:** REPORTS_DASHBOARD deve estar habilitada na loja

## 📊 Dashboard Overview

```bash
GET /v1/reports/dashboard

# Retorna:
{
  "totalCustomers": 350,
  "totalPets": 200,
  "totalStores": 15,
  "activeEmployees": 45,
  "period": "MONTH"
}
```

## 📈 Períodos Disponíveis

| Período | Descrição |
|---------|-----------|
| **DAY** | Últimas 24 horas |
| **WEEK** | Últimos 7 dias |
| **MONTH** | Últimos 30 dias |
| **YEAR** | Últimos 12 meses |
| **CUSTOM** | Período personalizado (requer startDate e endDate) |

## 📝 Exemplos

### Customer Analytics

```bash
# Últimos 30 dias
GET /v1/reports/customers?period=MONTH

# Período customizado
GET /v1/reports/customers?period=CUSTOM&startDate=2025-09-01&endDate=2025-10-01

# Resposta:
{
  "period": "MONTH",
  "totalCustomers": 350,
  "newCustomers": 25,
  "growthRate": 7.7,
  "byStatus": {
    "ACTIVE": 330,
    "INACTIVE": 20
  }
}
```

### Pet Statistics

```bash
GET /v1/reports/pets?period=WEEK

# Resposta:
{
  "period": "WEEK",
  "totalPets": 200,
  "newPets": 10,
  "bySpecies": {
    "DOG": 150,
    "CAT": 45,
    "BIRD": 5
  },
  "bySize": {
    "SMALL": 80,
    "MEDIUM": 70,
    "LARGE": 50
  }
}
```

### Store Performance

```bash
GET /v1/reports/stores/{storeId}/performance?period=MONTH

# Resposta:
{
  "storeId": "uuid",
  "storeName": "Loja Centro",
  "period": "MONTH",
  "appointments": 250,
  "revenue": 125000,  // R$ 1,250.00
  "topServices": [
    {
      "serviceName": "Banho e Tosa",
      "count": 80,
      "revenue": 40000
    }
  ],
  "occupancyRate": 75.5
}
```

## 🎯 Casos de Uso

### 1. Dashboard Executivo
```bash
GET /v1/reports/dashboard
```
- KPIs principais
- Visão geral do negócio
- Métricas em tempo real

### 2. Análise de Crescimento
```bash
GET /v1/reports/customers?period=YEAR
```
- Crescimento de clientes
- Taxa de conversão
- Clientes ativos vs inativos

### 3. Estatísticas de Pets
```bash
GET /v1/reports/pets?period=MONTH
```
- Distribuição por espécie
- Novos cadastros
- Tendências

### 4. Performance de Loja
```bash
GET /v1/reports/stores/{storeId}/performance?period=MONTH
```
- Faturamento
- Serviços mais vendidos
- Taxa de ocupação
- Produtividade

## 📊 Filtros

**Customers & Pets:**
- `period`: DAY, WEEK, MONTH, YEAR, CUSTOM
- `startDate`: YYYY-MM-DD (para CUSTOM)
- `endDate`: YYYY-MM-DD (para CUSTOM)

**Store Performance:**
- `period`: DAY, WEEK, MONTH, YEAR

## 💡 Insights Gerados

- 📈 Crescimento de clientes
- 🐾 Espécies mais populares
- 💰 Serviços mais rentáveis
- ⏰ Horários de pico
- 📅 Sazonalidade

## 📦 Variáveis

- `base_url`: http://localhost:3000
- `access_token`: Token JWT
- `store_id`: ID da loja

