# PDV/Caixa - SuperPet API

## Visão Geral

O módulo PDV/Caixa do SuperPet oferece funcionalidades completas para vendas no balcão, incluindo:

- **Gestão de Carrinho**: Criação, adição de itens e cálculo de totais
- **Processamento de Pagamento**: Suporte a múltiplos métodos de pagamento
- **Geração de Recibos**: Emissão de comprovantes de venda
- **Relatórios de Vendas**: Resumos diários e consultas avançadas

## Endpoints Principais

### 🛒 Carrinho

#### Criar Carrinho
```http
POST /v1/pdv/carts
```

**Body:**
```json
{
  "storeId": "uuid",
  "customerId": "uuid", // opcional
  "employeeId": "uuid"  // opcional
}
```

#### Buscar Carrinho
```http
GET /v1/pdv/carts/{cartId}
```

#### Listar Carrinhos por Loja
```http
GET /v1/pdv/stores/{storeId}/carts?status=OPEN
```

#### Buscar Carrinho Ativo
```http
GET /v1/pdv/stores/{storeId}/carts/active?customerId={customerId}
```

### 🛍️ Itens do Carrinho

#### Adicionar Produto
```http
POST /v1/pdv/carts/{cartId}/items
```

**Body:**
```json
{
  "type": "PRODUCT",
  "productId": "uuid",
  "name": "Nome do Produto",
  "unitPrice": 25.50,
  "quantity": 2,
  "discountAmount": 2.00,
  "taxAmount": 1.00
}
```

#### Adicionar Serviço
```http
POST /v1/pdv/carts/{cartId}/items
```

**Body:**
```json
{
  "type": "SERVICE",
  "serviceId": "uuid",
  "name": "Nome do Serviço",
  "unitPrice": 50.00,
  "quantity": 1,
  "discountAmount": 5.00,
  "taxAmount": 2.50
}
```

#### Atualizar Item
```http
PUT /v1/pdv/carts/{cartId}/items/{itemId}
```

**Body:**
```json
{
  "quantity": 3,
  "discountAmount": 5.00,
  "taxAmount": 1.50
}
```

#### Remover Item
```http
DELETE /v1/pdv/carts/{cartId}/items/{itemId}
```

### 💰 Pagamento

#### Processar Pagamento
```http
POST /v1/pdv/carts/{cartId}/payment
```

**Body:**
```json
{
  "amount": 100.00,
  "paymentMethod": "PIX",
  "transactionDetails": "Detalhes da transação"
}
```

**Métodos de Pagamento Suportados:**
- `CREDIT_CARD` - Cartão de Crédito
- `DEBIT_CARD` - Cartão de Débito
- `PIX` - PIX
- `CASH` - Dinheiro
- `BANK_TRANSFER` - Transferência Bancária
- `OTHER` - Outros

### 🧾 Recibos

#### Gerar Recibo
```http
POST /v1/pdv/carts/{cartId}/receipt
```

**Body:**
```json
{
  "notes": "Observações do recibo"
}
```

#### Listar Recibos
```http
GET /v1/pdv/carts/{cartId}/receipts
```

### 📊 Relatórios

#### Resumo de Vendas Diárias
```http
GET /v1/pdv/stores/{storeId}/sales/daily?date=2024-10-24
```

**Response:**
```json
{
  "totalAmount": 1500.00,
  "transactionCount": 25,
  "paymentMethods": {
    "PIX": 800.00,
    "CREDIT_CARD": 500.00,
    "CASH": 200.00
  }
}
```

### 🔍 Busca Avançada

#### Buscar Carrinhos
```http
GET /v1/pdv/carts?storeId={storeId}&status={status}&startDate={startDate}&endDate={endDate}
```

**Parâmetros de Query:**
- `storeId` - ID da loja
- `customerId` - ID do cliente
- `employeeId` - ID do funcionário
- `status` - Status do carrinho (OPEN, COMPLETED, etc.)
- `startDate` - Data inicial (YYYY-MM-DD)
- `endDate` - Data final (YYYY-MM-DD)

## Estados do Carrinho

- `OPEN` - Carrinho aberto, aceitando itens
- `PENDING_PAYMENT` - Aguardando pagamento
- `COMPLETED` - Venda finalizada
- `ABANDONED` - Carrinho abandonado
- `CANCELLED` - Carrinho cancelado

## Estados da Transação

- `PENDING` - Pagamento pendente
- `COMPLETED` - Pagamento concluído
- `FAILED` - Pagamento falhou
- `CANCELLED` - Pagamento cancelado
- `REFUNDED` - Pagamento estornado

## Tipos de Recibo

- `SALE` - Venda normal
- `REFUND` - Devolução
- `EXCHANGE` - Troca

## Exemplo de Fluxo Completo

### 1. Criar Carrinho
```bash
curl -X POST http://localhost:3000/v1/pdv/carts \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "store-uuid",
    "customerId": "customer-uuid"
  }'
```

### 2. Adicionar Produtos/Serviços
```bash
curl -X POST http://localhost:3000/v1/pdv/carts/{cartId}/items \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PRODUCT",
    "productId": "product-uuid",
    "name": "Ração Premium",
    "unitPrice": 45.90,
    "quantity": 2
  }'
```

### 3. Calcular Totais
```bash
curl -X GET http://localhost:3000/v1/pdv/carts/{cartId}/totals \
  -H "Authorization: Bearer {token}"
```

### 4. Processar Pagamento
```bash
curl -X POST http://localhost:3000/v1/pdv/carts/{cartId}/payment \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 91.80,
    "paymentMethod": "PIX"
  }'
```

### 5. Gerar Recibo
```bash
curl -X POST http://localhost:3000/v1/pdv/carts/{cartId}/receipt \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Venda realizada com sucesso"
  }'
```

## Códigos de Erro Comuns

- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Recurso não encontrado
- `409` - Conflito (ex: carrinho já existe)

## Permissões Necessárias

- **OWNER/ADMIN/STAFF**: Podem criar carrinhos e processar pagamentos
- **VIEWER**: Podem apenas consultar carrinhos e relatórios

## Testes Automatizados

Execute os testes do PDV/Caixa:

```bash
# Executar todos os testes
npm run test:automation:all

# Executar apenas testes do PDV
node test/automation/pdv/pdv.test.js
```

## Collections Postman

Importe a collection `PDV-Caixa.postman_collection.json` no Postman para testar todos os endpoints facilmente.

## Integração com Outros Módulos

O PDV/Caixa integra-se com:

- **Stores**: Validação de lojas e funcionários
- **Customers**: Associação de vendas a clientes
- **Inventory**: Controle de estoque de produtos
- **Services**: Catálogo de serviços disponíveis
- **Employees**: Controle de acesso por funcionário
