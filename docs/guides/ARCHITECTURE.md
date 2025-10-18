# Arquitetura do Sistema - SuperPet API

## 📐 Estrutura de Entidades

### Relacionamentos

```
User (1) ───> (1) Customer
                  │
                  ├──> (1) Address
                  ├──> (1) PersonData
                  └──> (N) Pets
```

## 🏗️ Módulos

### 1. Users Module
- **Entidade**: `UserEntity`
- **Responsabilidade**: Gerenciamento de usuários e autenticação
- **Campos**:
  - `id`, `email`, `password`, `name`
  - `role` (enum: admin, customer, employee)
  - `refreshToken`, `resetPasswordToken`, `resetPasswordExpires`

### 2. Customers Module
- **Entidades**: 
  - `CustomerEntity` (principal)
  - `AddressEntity` (relacionada)
  - `PersonDataEntity` (relacionada)
  
- **Responsabilidade**: Gerenciamento completo de customers e seus dados pessoais/endereço

#### CustomerEntity
- **Campos**: `id`, `userId`, `phone`, `notes`, `active`
- **Relacionamentos**: 
  - OneToOne com `User`
  - OneToOne com `Address`
  - OneToOne com `PersonData`
  - OneToMany com `Pet`

#### AddressEntity
- **Campos**: `zipCode`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`, `country`
- **Relacionamento**: OneToOne com `Customer`

#### PersonDataEntity
- **Campos**: `fullName`, `documentType`, `documentNumber`, `birthDate`, `phoneAlternative`, `emailAlternative`
- **Tipos de Documento**: CPF, CNPJ, RG, Passport
- **Relacionamento**: OneToOne com `Customer`

### 3. Pets Module
- **Entidade**: `PetEntity`
- **Responsabilidade**: Gerenciamento de pets
- **Campos**: `name`, `type`, `breed`, `gender`, `birthDate`, `weight`, `notes`, `customerId`
- **Tipos**: dog, cat, bird, rabbit, other
- **Gêneros**: male, female
- **Relacionamento**: ManyToOne com `Customer`

## 🔧 Camadas da Aplicação

### 1. Controllers
- **Responsabilidade**: Receber requisições HTTP e retornar respostas
- **Exposição**: Apenas Customer e Pet possuem controllers
- **Validação**: DTOs com class-validator

### 2. Services
- **Responsabilidade**: Lógica de negócio
- **Organização**: Separados por operação (create, get, update, delete)
- **Customer Services**: Orquestram Address e PersonData services internamente

#### Services Internos (sem controller):
- `AddressService`: Manipulação de endereços
- `PersonDataService`: Manipulação de dados pessoais

### 3. Repositories
- **Responsabilidade**: Acesso a dados (TypeORM)
- **Separação**: Cada entidade possui seu próprio repository
- **Paginação**: Implementada nos repositories de Customer e Pet

## 📄 DTOs

### Paginação
- `PaginationDto`: `page` (default: 1), `limit` (default: 10, max: 100)
- `PaginatedResult<T>`: Retorna `data[]` e `meta` com informações de paginação

### Customer
- `CreateCustomerDto`: Inclui dados de User, Customer, Address e PersonData
- `UpdateCustomerDto`: Atualização parcial de todos os dados

### Pet
- `CreatePetDto`: Dados do pet + `customerId`
- `UpdatePetDto`: Atualização parcial

### Address & PersonData
- Manipulados apenas através do Customer
- `CreateAddressDto` e `CreatePersonDataDto` são nested em `CreateCustomerDto`

## 🔐 Segurança

### Autenticação
- JWT com tokens de acesso e refresh
- Guards aplicados em todos os endpoints (exceto auth públicos)

### Senhas
- Hash com bcrypt (salt rounds: 10)
- Validação mínima de 6 caracteres

### Documentos
- `documentNumber` único no sistema
- Validação de duplicidade

## 🗄️ Banco de Dados

### Migrations
Ordem de execução:
1. `AddRoleToUsers` - Adiciona role enum na tabela users
2. `CreateCustomersTable` - Cria tabela customers
3. `CreateAddressesTable` - Cria tabela addresses
4. `CreatePersonDataTable` - Cria tabela person_data
5. `CreatePetsTable` - Cria tabela pets

### Cascading
- Deletar User → Deleta Customer → Deleta Address, PersonData e Pets
- Configurado via `onDelete: 'CASCADE'` nas foreign keys

## 🔄 Fluxo de Criação de Customer

```typescript
CustomerController.create()
  └─> CustomerCreateService.create()
      ├─> CustomersRepository.create() // Cria User + Customer
      ├─> AddressService.create() // Cria Address
      └─> PersonDataService.create() // Cria PersonData
```

## 🔄 Fluxo de Atualização de Customer

```typescript
CustomerController.update()
  └─> CustomerUpdateService.update()
      ├─> CustomersRepository.update() // Atualiza User + Customer
      ├─> AddressService.update() // Atualiza Address (se fornecido)
      └─> PersonDataService.update() // Atualiza PersonData (se fornecido)
```

## 📊 Paginação

### Endpoints com Paginação
- `GET /customers?page=1&limit=10`
- `GET /pets?page=1&limit=10`

### Resposta Paginada
```json
{
  "data": [...],
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

## 🎯 Boas Práticas

1. **Separação de Responsabilidades**: Cada service tem uma única responsabilidade
2. **Reutilização**: Services internos (Address, PersonData) são reutilizados
3. **Validação em Camadas**: 
   - DTOs (class-validator)
   - Services (lógica de negócio)
   - Database (constraints)
4. **Tratamento de Erros**: Exceptions específicas (NotFoundException, BadRequestException)
5. **Transações**: Operações compostas devem ser atômicas

