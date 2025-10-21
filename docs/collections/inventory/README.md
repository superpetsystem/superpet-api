# SuperPet - Inventory Management Collection

Collection para gestão completa de estoque e produtos.

## 📋 Endpoints (13)

### Products
1. **POST** `/v1/products` - Criar produto
2. **GET** `/v1/products` - Listar produtos
3. **GET** `/v1/products/:id` - Ver produto
4. **PUT** `/v1/products/:id` - Atualizar produto
5. **DELETE** `/v1/products/:id` - Deletar produto

### Stock Management
6. **GET** `/v1/stores/:storeId/stock` - Ver estoque da loja
7. **POST** `/v1/stores/:storeId/stock/movements` - Adicionar movimentação
8. **POST** `/v1/stores/:storeId/stock/adjust` - Ajustar estoque
9. **GET** `/v1/stores/:storeId/stock/movements` - Histórico de movimentações
10. **GET** `/v1/stores/:storeId/stock/alerts` - Alertas de estoque baixo

### Transfers
11. **POST** `/v1/transfers` - Transferir entre lojas
12. **GET** `/v1/stores/:storeId/expiring` - Produtos próximos ao vencimento

## ✅ Requisitos

**Feature:** INVENTORY_MANAGEMENT deve estar habilitada na loja

## 📦 Categorias de Produtos

- **FOOD** - Alimentos e rações
- **HYGIENE** - Produtos de higiene
- **MEDICATION** - Medicamentos
- **ACCESSORIES** - Acessórios
- **TOYS** - Brinquedos
- **OTHER** - Outros

## 🔄 Tipos de Movimentação

| Tipo | Descrição | Impacto |
|------|-----------|---------|
| **ENTRY** | Entrada (compra, produção) | ➕ Aumenta estoque |
| **EXIT** | Saída (venda, uso) | ➖ Diminui estoque |
| **ADJUSTMENT** | Ajuste manual | ↕️ Define quantidade |
| **TRANSFER_IN** | Recebimento de transferência | ➕ Aumenta estoque |
| **TRANSFER_OUT** | Envio de transferência | ➖ Diminui estoque |

## 📝 Exemplos

### Criar Produto
```json
POST /v1/products
{
  "code": "SHP_001",
  "name": "Shampoo Premium",
  "description": "Shampoo hipoalergênico",
  "category": "HYGIENE",
  "unit": "UN",
  "minStockLevel": 10,
  "maxStockLevel": 100,
  "costPrice": 2500,  // R$ 25.00 em centavos
  "salePrice": 4500   // R$ 45.00 em centavos
}
```

### Adicionar Entrada
```json
POST /v1/stores/{storeId}/stock/movements
{
  "productId": "uuid",
  "type": "ENTRY",
  "quantity": 50,
  "reason": "Compra de fornecedor",
  "notes": "Lote 001/2025"
}
```

### Registrar Venda (Saída)
```json
POST /v1/stores/{storeId}/stock/movements
{
  "productId": "uuid",
  "type": "EXIT",
  "quantity": 10,
  "reason": "Venda ao cliente",
  "saleId": "sale-uuid"
}
```

### Ajustar Estoque
```json
POST /v1/stores/{storeId}/stock/adjust
{
  "productId": "uuid",
  "newQuantity": 30,
  "reason": "Correção após inventário físico"
}
```

### Transferir Entre Lojas
```json
POST /v1/transfers
{
  "productId": "uuid",
  "fromStoreId": "store-1-uuid",
  "toStoreId": "store-2-uuid",
  "quantity": 10,
  "notes": "Balanceamento de estoque"
}
```

## ⚠️ Validações

- ✅ Código do produto único por organização
- ✅ Estoque não pode ficar negativo
- ✅ Transferências apenas entre lojas da mesma organização
- ✅ Preços devem ser em centavos (inteiro)
- ✅ Quantidade deve ser positiva

## 📊 Alertas

### Estoque Baixo
```bash
GET /v1/stores/{storeId}/stock/alerts

# Retorna produtos onde:
# currentStock < minStockLevel
```

### Produtos Vencendo
```bash
GET /v1/stores/{storeId}/expiring?days=30

# Produtos que vencem nos próximos 30 dias
```

## 📦 Variáveis

- `base_url`: http://localhost:3000
- `access_token`: Token JWT
- `store_id`: ID da loja
- `store_id_2`: ID da loja destino (transfers)
- `product_id`: ID do produto

