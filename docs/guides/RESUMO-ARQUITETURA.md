# 📋 Resumo da Arquitetura - SuperPet API

## 🏗️ Estrutura de Módulos

### Módulos Criados
1. **CustomersModule** - Gerenciamento de clientes
2. **PetsModule** - Gerenciamento de pets
3. **UsersModule** (existente) - Gerenciamento de usuários base

### Entidades Internas (sem módulo próprio)
- **AddressEntity** - Endereços (gerenciado pelo CustomersModule)
- **PersonDataEntity** - Dados pessoais (gerenciado pelo CustomersModule)

---

## 🎮 Controllers (Endpoints Públicos)

### ✅ CustomersController
**Rota Base:** `/customers`

**Endpoints:**
- `POST /customers` - Criar customer completo (user + customer + address + personData)
- `GET /customers?page=1&limit=10` - Listar customers (paginado)
- `GET /customers/:id` - Buscar customer por ID
- `GET /customers/email/:email` - Buscar customer por email
- `PUT /customers/:id` - Atualizar customer (incluindo address e personData)
- `DELETE /customers/:id` - Deletar customer

### ✅ PetsController
**Rota Base:** `/pets`

**Endpoints:**
- `POST /pets` - Criar pet
- `GET /pets?page=1&limit=10` - Listar pets (paginado)
- `GET /pets/:id` - Buscar pet por ID
- `GET /pets/customer/:customerId` - Buscar pets de um customer
- `PUT /pets/:id` - Atualizar pet
- `DELETE /pets/:id` - Deletar pet

---

## ⚙️ Services (Lógica de Negócio)

### 📦 Customer Services
**Localização:** `src/customers/services/`

1. **CustomerCreateService**
   - Orquestra criação de User + Customer + Address + PersonData
   - **Usa internamente:**
     - `AddressService.create()`
     - `PersonDataService.create()`

2. **CustomerGetService**
   - Busca customers com paginação
   - Retorna dados completos com relacionamentos

3. **CustomerUpdateService**
   - Atualiza User + Customer
   - **Usa internamente:**
     - `AddressService.update()` (se fornecido)
     - `PersonDataService.update()` (se fornecido)

4. **CustomerDeleteService**
   - Deleta customer (cascade automático para address e personData)

### 🐾 Pet Services
**Localização:** `src/pets/services/`

1. **PetCreateService** - Criar pet
2. **PetGetService** - Buscar pets (com paginação)
3. **PetUpdateService** - Atualizar pet
4. **PetDeleteService** - Deletar pet

### 🏠 Address Service (Interno)
**Localização:** `src/customers/services/address.service.ts`

**Não tem controller próprio!** Usado apenas pelos Customer Services.

**Métodos:**
- `create(customerId, addressDto)` - Criar endereço
- `findByCustomerId(customerId)` - Buscar endereço
- `update(id, addressDto)` - Atualizar endereço
- `delete(id)` - Deletar endereço

### 👤 PersonData Service (Interno)
**Localização:** `src/customers/services/person-data.service.ts`

**Não tem controller próprio!** Usado apenas pelos Customer Services.

**Métodos:**
- `create(customerId, personDataDto)` - Criar dados pessoais
- `findByCustomerId(customerId)` - Buscar dados pessoais
- `update(id, personDataDto)` - Atualizar dados pessoais
- `delete(id)` - Deletar dados pessoais

---

## 💾 Repositories (Acesso a Dados)

### 📂 Repositories Criados

1. **CustomersRepository** (`src/customers/customers.repository.ts`)
   - Gerencia operações de User + Customer
   - Paginação implementada

2. **AddressRepository** (`src/customers/repositories/address.repository.ts`)
   - CRUD de endereços
   - Usado internamente pelo AddressService

3. **PersonDataRepository** (`src/customers/repositories/person-data.repository.ts`)
   - CRUD de dados pessoais
   - Validação de documento único
   - Usado internamente pelo PersonDataService

4. **PetsRepository** (`src/pets/pets.repository.ts`)
   - CRUD de pets
   - Paginação implementada
   - Retorna relacionamentos completos (customer, address, personData)

---

## 🔄 Fluxo de Dados

### Criação de Customer
```
CustomerController.create()
    ↓
CustomerCreateService.create()
    ↓
    ├─→ CustomersRepository.create() [Cria User + Customer]
    ├─→ AddressService.create()
    │       ↓
    │   AddressRepository.create() [Cria Address]
    └─→ PersonDataService.create()
            ↓
        PersonDataRepository.create() [Cria PersonData]
```

### Atualização de Customer
```
CustomerController.update()
    ↓
CustomerUpdateService.update()
    ↓
    ├─→ CustomersRepository.update() [Atualiza User + Customer]
    ├─→ AddressService.update() [Se fornecido]
    │       ↓
    │   AddressRepository.update()
    └─→ PersonDataService.update() [Se fornecido]
            ↓
        PersonDataRepository.update()
```

### Criação de Pet
```
PetController.create()
    ↓
PetCreateService.create()
    ↓
PetsRepository.create() [Cria Pet vinculado ao Customer]
```

---

## 🗂️ Estrutura de Pastas

```
src/
├── customers/
│   ├── entities/
│   │   ├── customer.entity.ts
│   │   ├── address.entity.ts
│   │   └── person-data.entity.ts
│   ├── dto/
│   │   ├── create-customer.dto.ts
│   │   ├── update-customer.dto.ts
│   │   ├── create-address.dto.ts
│   │   └── create-person-data.dto.ts
│   ├── repositories/
│   │   ├── address.repository.ts
│   │   └── person-data.repository.ts
│   ├── services/
│   │   ├── customer-create.service.ts
│   │   ├── customer-get.service.ts
│   │   ├── customer-update.service.ts
│   │   ├── customer-delete.service.ts
│   │   ├── address.service.ts          ← Interno
│   │   └── person-data.service.ts      ← Interno
│   ├── customers.repository.ts
│   ├── customers.controller.ts
│   └── customers.module.ts
│
├── pets/
│   ├── entities/
│   │   └── pet.entity.ts
│   ├── dto/
│   │   ├── create-pet.dto.ts
│   │   └── update-pet.dto.ts
│   ├── services/
│   │   ├── pet-create.service.ts
│   │   ├── pet-get.service.ts
│   │   ├── pet-update.service.ts
│   │   └── pet-delete.service.ts
│   ├── pets.repository.ts
│   ├── pets.controller.ts
│   └── pets.module.ts
│
└── common/
    └── dto/
        └── pagination.dto.ts
```

---

## 🔗 Relacionamentos entre Entidades

```
User (1) ──┬──> (1) Customer
           │         │
           │         ├──> (1) Address
           │         ├──> (1) PersonData
           │         └──> (N) Pets
           │
           └──> (tem role: admin | customer | employee)
```

---

## 📌 Pontos Importantes

### ✅ Boas Práticas Implementadas

1. **Separação de Responsabilidades**
   - Services divididos por operação (create, get, update, delete)
   - Services internos (Address, PersonData) não expostos publicamente

2. **Reutilização de Código**
   - AddressService e PersonDataService são reutilizados pelos CustomerServices
   - Evita duplicação de lógica

3. **Paginação**
   - Implementada em CustomersRepository e PetsRepository
   - Query params: `?page=1&limit=10`
   - Response com metadata (total, totalPages, hasNextPage, etc)

4. **Validação em Camadas**
   - DTOs (class-validator)
   - Services (lógica de negócio)
   - Database (constraints, unique)

5. **Segurança**
   - Senhas hasheadas com bcrypt
   - JWT Authentication em todos os endpoints
   - Documentos únicos (CPF, CNPJ, etc)

### 🚫 O que NÃO foi exposto

- **Address** e **PersonData** NÃO têm controllers próprios
- São manipulados exclusivamente através do CustomersController
- Mantém a integridade dos dados (customer sempre tem address e personData)

---

## 🎯 Como Usar

### Criar um Customer Completo
```http
POST /customers
{
  "email": "joao@example.com",
  "password": "senha123",
  "name": "João Silva",
  "phone": "(11) 98765-4321",
  "address": {
    "zipCode": "01310-100",
    "street": "Av Paulista",
    "number": "1000",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP"
  },
  "personData": {
    "fullName": "João da Silva Santos",
    "documentType": "cpf",
    "documentNumber": "123.456.789-00",
    "birthDate": "1990-05-15"
  }
}
```

### Criar um Pet
```http
POST /pets
{
  "name": "Rex",
  "type": "dog",
  "breed": "Labrador",
  "gender": "male",
  "birthDate": "2020-05-15",
  "weight": 25.5,
  "customerId": "uuid-do-customer"
}
```

### Listar Customers (Paginado)
```http
GET /customers?page=1&limit=10
```

### Buscar Pets de um Customer
```http
GET /pets/customer/:customerId
```

