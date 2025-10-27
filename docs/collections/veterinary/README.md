# SuperPet - Veterinary Records Collection

Collection para prontuários veterinários e controle de vacinação.

## 📋 Endpoints (7)

### Medical Records
1. **POST** `/veterinary/records` - Criar prontuário médico
2. **GET** `/veterinary/records/:id` - Ver prontuário
3. **GET** `/veterinary/pets/:petId/records` - Histórico do pet
4. **PUT** `/veterinary/records/:id` - Atualizar prontuário

### Vaccinations
5. **POST** `/veterinary/vaccinations` - Registrar vacinação
6. **GET** `/veterinary/pets/:petId/vaccinations` - Histórico de vacinas
7. **GET** `/veterinary/pets/:petId/vaccinations/upcoming` - Lembretes de vacinas

## ✅ Requisitos

**Feature:** VETERINARY_RECORDS deve estar habilitada na loja

**Para habilitar:**
```bash
# Via SUPER_ADMIN
POST /admin/stores/{storeId}/features/VETERINARY_RECORDS
{
  "enabled": true,
  "limits": {
    "maxRecordsPerPet": 1000
  }
}
```

## 🏥 Tipos de Consulta

- **CONSULTATION** - Consulta de rotina
- **EXAM** - Exames
- **SURGERY** - Cirurgias
- **EMERGENCY** - Emergências
- **OTHER** - Outros

## 💉 Vacinas Comuns

- **V10 (Múltipla)** - Proteção contra 10 doenças
- **V8** - Versão básica
- **Antirrábica** - Obrigatória
- **Giárdia** - Parasitas
- **Gripe Canina** - Bordetella

## 📝 Exemplo de Prontuário

```bash
POST /veterinary/records
{
  "petId": "uuid",
  "storeId": "uuid",
  "veterinarianId": "uuid",
  "type": "CONSULTATION",
  "visitDate": "2025-10-21T14:00:00.000Z",
  "reason": "Consulta de rotina",
  "symptoms": "Pet saudável",
  "diagnosis": "Saúde normal",
  "treatment": "Manter dieta e exercícios",
  "weightKg": 32.5,
  "temperatureCelsius": 38.5,
  "notes": "Pet muito bem cuidado"
}
```

## 💉 Exemplo de Vacinação

```bash
POST /veterinary/vaccinations
{
  "petId": "uuid",
  "vaccineName": "V10 (Múltipla)",
  "manufacturer": "Zoetis",
  "batchNumber": "BATCH-2025-001",
  "applicationDate": "2025-10-21",
  "nextDoseDate": "2026-04-21",
  "notes": "Primeira dose - Reforço em 6 meses"
}
```

## 🔔 Lembretes de Vacinação

```bash
# Vacinas próximas nos próximos 30 dias
GET /veterinary/pets/{petId}/vaccinations/upcoming?days=30
```

## 📊 Campos de Prontuário

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| petId | UUID | ✅ |
| storeId | UUID | ✅ |
| veterinarianId | UUID | ✅ |
| type | Enum | ✅ |
| visitDate | DateTime | ✅ |
| reason | String | ✅ |
| symptoms | String | ❌ |
| diagnosis | String | ❌ |
| treatment | String | ❌ |
| weightKg | Number | ❌ |
| temperatureCelsius | Number | ❌ |
| notes | String | ❌ |

## 📦 Variáveis

- `base_url`: http://localhost:3000
- `access_token`: Token JWT
- `pet_id`: ID do pet
- `store_id`: ID da loja
- `employee_id`: ID do veterinário
- `record_id`: ID do prontuário
- `vaccination_id`: ID da vacinação

