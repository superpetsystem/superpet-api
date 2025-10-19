# 👥 Postman Collection - Customers

Collection do Postman para testar os endpoints de Customers.

## 📂 Arquivo

- `SuperPet-Customers.postman_collection.json`

## 📋 Endpoints Incluídos

1. **Create Customer** - POST `/customers`
2. **Get All Customers (Paginated)** - GET `/customers?page=1&limit=10`
3. **Get All Customers (Simple)** - GET `/customers/all`
4. **Get Customer by ID** - GET `/customers/:id`
5. **Get Customer by Email** - GET `/customers/email/:email`
6. **Update Customer** - PUT `/customers/:id`
7. **Update Customer Password** - PUT `/customers/:id`
8. **Delete Customer** - DELETE `/customers/:id`

## 🔧 Variáveis Necessárias

Configure no environment:
- `baseUrl` - URL da API (ex: `http://localhost:3000`)
- `accessToken` - Token JWT obtido no login
- `customerId` - ID do customer (obtido após criar)

## ✅ Exemplos de Response

Todos os endpoints incluem exemplos de responses com:
- Status codes (200, 201, 204, 400, 404)
- JSON de resposta formatado
- Headers

## 🚀 Importar

1. Abra o Postman
2. Clique em **Import**
3. Selecione `SuperPet-Customers.postman_collection.json`
4. Configure o environment
5. Execute as requests!

