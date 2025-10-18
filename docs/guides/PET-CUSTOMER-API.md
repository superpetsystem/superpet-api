# API de Pets e Customers

Esta documentação descreve os endpoints disponíveis para gerenciar Customers (Clientes) e seus Pets.

## 📌 Estrutura de Dados

### Customer
Um Customer é composto por:
- **User**: Dados de login (email, password, name)
- **Customer**: Dados do cliente (phone, notes, active)
- **Address**: Endereço completo
- **PersonData**: Dados pessoais (nome completo, documento, etc)

### Relacionamentos
```
User → Customer → Address
            ↓
        PersonData
            ↓
          Pets
```

## 🔐 Autenticação

Todos os endpoints requerem autenticação JWT. Inclua o token no header:
```
Authorization: Bearer {seu-token-jwt}
```

## 📋 Customers

### 1. Criar Customer
```http
POST /customers
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "senha123",
  "name": "João Silva",
  "phone": "(11) 98765-4321",
  "notes": "Cliente VIP",
  "address": {
    "zipCode": "01310-100",
    "street": "Avenida Paulista",
    "number": "1000",
    "complement": "Apto 101",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil"
  },
  "personData": {
    "fullName": "João da Silva Santos",
    "documentType": "cpf",
    "documentNumber": "123.456.789-00",
    "birthDate": "1990-05-15",
    "phoneAlternative": "(11) 3333-4444",
    "emailAlternative": "joao.alternativo@example.com"
  }
}
```

**Resposta (201 Created):**
```json
{
  "id": "uuid-customer",
  "userId": "uuid-user",
  "phone": "(11) 98765-4321",
  "notes": "Cliente VIP",
  "active": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "uuid-user",
    "email": "customer@example.com",
    "name": "João Silva",
    "role": "customer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "address": {
    "id": "uuid-address",
    "zipCode": "01310-100",
    "street": "Avenida Paulista",
    "number": "1000",
    "complement": "Apto 101",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "personData": {
    "id": "uuid-person-data",
    "fullName": "João da Silva Santos",
    "documentType": "cpf",
    "documentNumber": "123.456.789-00",
    "birthDate": "1990-05-15",
    "phoneAlternative": "(11) 3333-4444",
    "emailAlternative": "joao.alternativo@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Listar Todos os Customers (Paginado)
```http
GET /customers?page=1&limit=10
```

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-customer",
      "userId": "uuid-user",
      "phone": "(11) 98765-4321",
      "notes": "Cliente VIP",
      "active": true,
      "user": {...},
      "address": {...},
      "personData": {...}
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 3. Buscar Customer por ID
```http
GET /customers/{id}
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "email": "customer@example.com",
  "name": "João Silva",
  "role": "customer",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 4. Buscar Customer por Email
```http
GET /customers/email/{email}
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "email": "customer@example.com",
  "name": "João Silva",
  "role": "customer",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 5. Atualizar Customer
```http
PUT /customers/{id}
Content-Type: application/json

{
  "name": "João Silva Santos",
  "email": "novoemail@example.com"
}
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "email": "novoemail@example.com",
  "name": "João Silva Santos",
  "role": "customer",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 6. Deletar Customer
```http
DELETE /customers/{id}
```

**Resposta (204 No Content)**

### 7. Listar Pets de um Customer
```http
GET /customers/{id}/pets
```

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "Rex",
    "type": "dog",
    "breed": "Labrador",
    "gender": "male",
    "birthDate": "2020-05-15",
    "weight": 25.5,
    "notes": "Muito amigável",
    "customerId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## 🐾 Pets

### 1. Criar Pet
```http
POST /pets
Content-Type: application/json

{
  "name": "Rex",
  "type": "dog",
  "breed": "Labrador",
  "gender": "male",
  "birthDate": "2020-05-15",
  "weight": 25.5,
  "notes": "Muito amigável",
  "customerId": "uuid-do-customer"
}
```

**Tipos de Pet disponíveis:**
- `dog` (Cachorro)
- `cat` (Gato)
- `bird` (Pássaro)
- `rabbit` (Coelho)
- `other` (Outro)

**Gêneros disponíveis:**
- `male` (Macho)
- `female` (Fêmea)

**Resposta (201 Created):**
```json
{
  "id": "uuid",
  "name": "Rex",
  "type": "dog",
  "breed": "Labrador",
  "gender": "male",
  "birthDate": "2020-05-15",
  "weight": 25.5,
  "notes": "Muito amigável",
  "customerId": "uuid-do-customer",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "customer": {
    "id": "uuid-do-customer",
    "email": "customer@example.com",
    "name": "João Silva"
  }
}
```

### 2. Listar Todos os Pets
```http
GET /pets
```

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "Rex",
    "type": "dog",
    "breed": "Labrador",
    "gender": "male",
    "birthDate": "2020-05-15",
    "weight": 25.5,
    "notes": "Muito amigável",
    "customerId": "uuid-do-customer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "customer": {
      "id": "uuid-do-customer",
      "email": "customer@example.com",
      "name": "João Silva"
    }
  }
]
```

### 3. Buscar Pet por ID
```http
GET /pets/{id}
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "name": "Rex",
  "type": "dog",
  "breed": "Labrador",
  "gender": "male",
  "birthDate": "2020-05-15",
  "weight": 25.5,
  "notes": "Muito amigável",
  "customerId": "uuid-do-customer",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "customer": {
    "id": "uuid-do-customer",
    "email": "customer@example.com",
    "name": "João Silva"
  }
}
```

### 4. Buscar Pets por Customer
```http
GET /pets/customer/{customerId}
```

**Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "Rex",
    "type": "dog",
    "breed": "Labrador",
    "gender": "male",
    "birthDate": "2020-05-15",
    "weight": 25.5,
    "notes": "Muito amigável",
    "customerId": "uuid-do-customer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "customer": {
      "id": "uuid-do-customer",
      "email": "customer@example.com",
      "name": "João Silva"
    }
  }
]
```

### 5. Atualizar Pet
```http
PUT /pets/{id}
Content-Type: application/json

{
  "weight": 27.5,
  "notes": "Atualizando o peso após consulta veterinária"
}
```

**Resposta (200 OK):**
```json
{
  "id": "uuid",
  "name": "Rex",
  "type": "dog",
  "breed": "Labrador",
  "gender": "male",
  "birthDate": "2020-05-15",
  "weight": 27.5,
  "notes": "Atualizando o peso após consulta veterinária",
  "customerId": "uuid-do-customer",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "customer": {
    "id": "uuid-do-customer",
    "email": "customer@example.com",
    "name": "João Silva"
  }
}
```

### 6. Deletar Pet
```http
DELETE /pets/{id}
```

**Resposta (204 No Content)**

## ⚠️ Códigos de Erro

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Failed to create customer",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Customer with ID {id} not found",
  "error": "Not Found"
}
```

## 📝 Notas Importantes

1. **Senhas**: Todas as senhas são automaticamente criptografadas usando bcrypt antes de serem armazenadas.

2. **Role do Customer**: Ao criar um customer, o campo `role` é automaticamente definido como `customer`.

3. **Cascade Delete**: Quando um customer é deletado, todos os seus pets são deletados automaticamente.

4. **Validações**:
   - Email deve ser válido
   - Senha deve ter no mínimo 6 caracteres
   - Todos os campos obrigatórios devem ser preenchidos

5. **Peso**: O campo weight aceita valores decimais com até 2 casas decimais (ex: 25.50).

6. **Data de Nascimento**: Deve ser enviada no formato ISO 8601 (YYYY-MM-DD).

