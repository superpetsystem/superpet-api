# 📍 Resumo de Endpoints - SuperPet API

## 🎯 Diferença entre Listagem Simples e Paginada

### 📄 Listagem Simples
- **Endpoint**: `/customers/all` e `/pets/all`
- **Retorno**: Array direto `CustomerEntity[]` ou `PetEntity[]`
- **Uso**: Quando você precisa de TODOS os registros de uma vez
- **Exemplo de uso**: Dropdowns, seleções, exportações completas

```json
[
  { "id": "...", "name": "..." },
  { "id": "...", "name": "..." }
]
```

### 📊 Listagem Paginada
- **Endpoint**: `/customers?page=1&limit=10` e `/pets?page=1&limit=10`
- **Retorno**: Objeto com `data` e `meta`
- **Uso**: Quando você tem muitos registros e quer paginar
- **Exemplo de uso**: Tabelas com paginação, listas longas

```json
{
  "data": [
    { "id": "...", "name": "..." }
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

---

## 👥 Customers Endpoints

### Listagem
| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| GET | `/customers/all` | Listar todos (simples) | `CustomerEntity[]` |
| GET | `/customers?page=1&limit=10` | Listar todos (paginado) | `PaginatedResult<CustomerEntity>` |

### CRUD
| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| POST | `/customers` | Criar customer | `CustomerEntity` |
| GET | `/customers/:id` | Buscar por ID | `CustomerEntity` |
| GET | `/customers/email/:email` | Buscar por email | `CustomerEntity` |
| PUT | `/customers/:id` | Atualizar customer | `CustomerEntity` |
| DELETE | `/customers/:id` | Deletar customer | `204 No Content` |

### Exemplo de Criação
```http
POST /customers
{
  "email": "joao@example.com",
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
    "emailAlternative": "joao.alt@example.com"
  }
}
```

---

## 🐾 Pets Endpoints

### Listagem
| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| GET | `/pets/all` | Listar todos (simples) | `PetEntity[]` |
| GET | `/pets?page=1&limit=10` | Listar todos (paginado) | `PaginatedResult<PetEntity>` |
| GET | `/pets/customer/:customerId` | Listar por customer | `PetEntity[]` |

### CRUD
| Método | Endpoint | Descrição | Retorno |
|--------|----------|-----------|---------|
| POST | `/pets` | Criar pet | `PetEntity` |
| GET | `/pets/:id` | Buscar por ID | `PetEntity` |
| PUT | `/pets/:id` | Atualizar pet | `PetEntity` |
| DELETE | `/pets/:id` | Deletar pet | `204 No Content` |

### Exemplo de Criação
```http
POST /pets
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

---

## 🔄 Quando Usar Cada Tipo

### Use Listagem Simples (`/all`) quando:
- ✅ Você precisa de todos os registros de uma vez
- ✅ A quantidade de registros é pequena/moderada (< 1000)
- ✅ Está populando dropdowns, select boxes
- ✅ Está fazendo cache de dados completos
- ✅ Está exportando dados completos

### Use Listagem Paginada (`?page=1&limit=10`) quando:
- ✅ Você tem muitos registros (> 100)
- ✅ Está mostrando em tabelas com paginação
- ✅ Quer melhor performance (carrega menos dados)
- ✅ Está fazendo scroll infinito
- ✅ O usuário não precisa ver todos os dados de uma vez

---

## 📊 Comparação de Performance

### Cenário: 1000 customers no banco

#### Listagem Simples
```bash
GET /customers/all
```
- **Retorna**: 1000 registros
- **Tamanho**: ~500KB - 2MB (dependendo dos dados)
- **Tempo**: ~200-500ms
- **Uso**: Quando realmente precisa de TODOS

#### Listagem Paginada
```bash
GET /customers?page=1&limit=10
```
- **Retorna**: 10 registros + metadata
- **Tamanho**: ~5-20KB
- **Tempo**: ~50-100ms
- **Uso**: Melhor para UI/UX

---

## 🎨 Exemplos de Uso

### Frontend - Dropdown de Customers
```typescript
// Use listagem simples
const customers = await api.get('/customers/all');
```

### Frontend - Tabela de Customers
```typescript
// Use listagem paginada
const result = await api.get('/customers?page=1&limit=10');
const customers = result.data;
const totalPages = result.meta.totalPages;
```

### Frontend - Buscar Pets de um Customer
```typescript
// Sempre retorna array simples
const pets = await api.get(`/pets/customer/${customerId}`);
```

---

## ⚡ Parâmetros de Paginação

### PaginationDto
```typescript
{
  page?: number;    // Padrão: 1
  limit?: number;   // Padrão: 10, Máximo: 100
}
```

### Exemplos
```bash
# Primeira página com 10 itens (padrão)
GET /customers

# Segunda página com 20 itens
GET /customers?page=2&limit=20

# Terceira página com 50 itens
GET /customers?page=3&limit=50

# Listagem simples (todos os registros)
GET /customers/all
```

---

## 📝 Notas Importantes

1. **Autenticação Obrigatória**: Todos os endpoints requerem JWT token
2. **Ordenação**: Ambas listagens retornam ordenadas por `createdAt DESC` (mais recentes primeiro)
3. **Relacionamentos**: Todos os endpoints retornam os relacionamentos completos
4. **Limite Máximo**: Paginação tem limite máximo de 100 itens por página
5. **Performance**: Sempre prefira paginação para grandes volumes de dados

---

## 🧪 Testando os Endpoints

### Testes Automatizados
```bash
# Testar customers
node test/automation/customers.test.js

# Testar pets
node test/automation/pets.test.js
```

### Manualmente com cURL
```bash
# Listagem simples
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/customers/all

# Listagem paginada
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/customers?page=1&limit=10
```

