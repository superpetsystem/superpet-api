# SuperPet - Admin (SUPER_ADMIN) Collection

Collection de endpoints exclusivos para SUPER_ADMIN.

## 🔐 Autenticação

**Role Requerida:** `SUPER_ADMIN`

**Credenciais Padrão:**
- Email: `superadmin@superpet.com.br`
- Password: `Super@2024!Admin`

> ⚠️ **IMPORTANTE:** SUPER_ADMIN só pode ser criado via SQL usando o script `apply-superadmin.js`

## 📋 Endpoints (11)

### Organizations
1. **GET** `/v1/admin/organizations` - Listar organizações
2. **POST** `/v1/admin/organizations` - Criar organização

### Stores
3. **POST** `/v1/admin/organizations/:id/stores` - Criar loja para organização

### Owners
4. **POST** `/v1/admin/organizations/:id/owners` - Criar OWNER para organização

### Features
5. **GET** `/v1/admin/features` - Listar todas features do sistema
6. **GET** `/v1/admin/stores/:storeId/features` - Features de uma loja
7. **POST** `/v1/admin/stores/:storeId/features/:key` - Habilitar feature
8. **PUT** `/v1/admin/stores/:storeId/features/:key/limits` - Atualizar limites
9. **DELETE** `/v1/admin/stores/:storeId/features/:key` - Desabilitar feature
10. **GET** `/v1/admin/organizations/:orgId/stores-features` - Auditoria de features

## 🎯 Features Disponíveis

| Key | Nome | Plano Mínimo |
|-----|------|--------------|
| SERVICE_CATALOG | Catálogo de Serviços | FREE |
| CUSTOM_SERVICE | Serviços Customizados | BASIC |
| TELEPICKUP | Busca e Entrega | PRO |
| LIVE_CAM | Câmera ao Vivo | PRO |
| INVENTORY_MANAGEMENT | Gestão de Estoque | BASIC |
| REPORTS_DASHBOARD | Relatórios e Dashboard | PRO |
| ONLINE_BOOKING | Agendamento Online | BASIC |
| VETERINARY_RECORDS | Prontuários Veterinários | PRO |
| +5 mais... | | |

## 🚀 Fluxo Típico

1. Login como SUPER_ADMIN
2. Criar organização
3. Criar loja para organização
4. Criar OWNER para organização
5. Habilitar features na loja
6. Owner pode fazer login e gerenciar sua organização

## 📝 Exemplo de Uso

```bash
# 1. Login
POST /auth/login
{
  "email": "superadmin@superpet.com.br",
  "password": "Super@2024!Admin"
}

# 2. Criar organização
POST /v1/admin/organizations
{
  "name": "PetShop ABC",
  "slug": "petshop-abc-123",
  "plan": "PRO",
  "limits": {
    "employees": 100,
    "stores": 20
  }
}

# 3. Habilitar feature
POST /v1/admin/stores/{storeId}/features/INVENTORY_MANAGEMENT
{
  "enabled": true,
  "limits": {
    "maxProducts": 1000
  }
}
```

## 🔒 Segurança

- ✅ Apenas SUPER_ADMIN tem acesso
- ✅ SUPER_ADMIN não pode ser criado via API
- ✅ Criação apenas via SQL direto
- ✅ Validação em cada endpoint
- ✅ Logs detalhados de todas operações

## 📦 Variáveis da Collection

- `base_url`: URL da API (default: http://localhost:3000)
- `access_token`: Token JWT do SUPER_ADMIN
- `super_admin_id`: ID do usuário SUPER_ADMIN
- `organization_id`: ID da organização criada
- `store_id`: ID da loja criada

