# 📬 Collections do Postman - SuperPet API

Este diretório contém as collections do Postman para testar os endpoints da API SuperPet.

## 📂 Estrutura Organizada

```
postman/
├── auth/                         (futuro - auth collection)
├── customers/
│   ├── SuperPet-Customers.postman_collection.json
│   └── README.md
├── pets/
│   ├── SuperPet-Pets.postman_collection.json
│   └── README.md
├── SuperPet-Environment.postman_environment.json
└── README.md (este arquivo)
```

## 📦 Collections Disponíveis

### 1. Customers Collection
**Localização**: `customers/SuperPet-Customers.postman_collection.json`
- 8 requests organizadas
- Todos os endpoints de Customers
- Exemplos de responses incluídos

### 2. Pets Collection
**Localização**: `pets/SuperPet-Pets.postman_collection.json`
- 10 requests organizadas
- Todos os endpoints de Pets
- Exemplos de responses incluídos
- Múltiplos tipos de pets

### 3. Environment
**Localização**: `SuperPet-Environment.postman_environment.json`
- Variáveis de ambiente compartilhadas
- Configurações de URLs e tokens

## 🚀 Como Importar

### 1. Importar Collections

1. Abra o Postman
2. Clique em **"Import"** (canto superior esquerdo)
3. Arraste os arquivos `.postman_collection.json` ou clique em **"Upload Files"**
4. Selecione os arquivos:
   - `SuperPet-Customers.postman_collection.json`
   - `SuperPet-Pets.postman_collection.json`
5. Clique em **"Import"**

### 2. Importar Environment

1. No Postman, vá em **"Environments"** (barra lateral esquerda)
2. Clique em **"Import"**
3. Selecione `SuperPet-Environment.postman_environment.json`
4. Clique em **"Import"**
5. **Selecione o environment** "SuperPet - Local" no dropdown (canto superior direito)

## 🔧 Configuração Inicial

### 1. Obter Token de Autenticação

Primeiro, você precisa de um token JWT. Use o endpoint de autenticação:

```bash
POST http://localhost:3000/auth/register
ou
POST http://localhost:3000/auth/login
```

**Body exemplo:**
```json
{
  "email": "teste@superpet.com",
  "password": "senha123",
  "name": "Usuário Teste"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### 2. Configurar Variáveis

No Postman, vá em **Environments** → **SuperPet - Local** e configure:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `baseUrl` | URL base da API | `http://localhost:3000` |
| `accessToken` | Token JWT obtido no login | `eyJhbGciOiJIUzI1NiIs...` |
| `customerId` | ID de um customer (após criar) | `uuid-aqui` |
| `petId` | ID de um pet (após criar) | `uuid-aqui` |

## 📋 Ordem de Execução Sugerida

### Para Customers

1. **Create Customer** - Cria um customer completo
   - Copie o `id` retornado e cole na variável `customerId`
2. **Get All Customers (Paginated)** - Lista com paginação
3. **Get All Customers (Simple)** - Lista simples
4. **Get Customer by ID** - Busca por ID (usa `{{customerId}}`)
5. **Get Customer by Email** - Busca por email
6. **Update Customer** - Atualiza dados
7. **Update Customer Password** - Atualiza senha
8. **Delete Customer** - Remove customer

### Para Pets

1. Primeiro, crie um customer e pegue o `customerId`
2. **Create Pet (Dog)** - Cria um cachorro
   - Copie o `id` retornado e cole na variável `petId`
3. **Create Pet (Cat)** - Cria um gato
4. **Create Pet (Bird)** - Cria um pássaro
5. **Get All Pets (Paginated)** - Lista com paginação
6. **Get All Pets (Simple)** - Lista simples
7. **Get Pet by ID** - Busca por ID (usa `{{petId}}`)
8. **Get Pets by Customer** - Lista pets de um customer
9. **Update Pet (Partial)** - Atualiza parcialmente
10. **Update Pet (Complete)** - Atualiza completamente
11. **Delete Pet** - Remove pet

## 💡 Dicas

### Variáveis Automáticas

As collections já usam variáveis do environment. Você só precisa:

1. **Definir `accessToken`** após fazer login
2. **Definir `customerId`** após criar um customer
3. **Definir `petId`** após criar um pet

### Tipos de Pet Disponíveis

- `dog` - Cachorro
- `cat` - Gato  
- `bird` - Pássaro
- `rabbit` - Coelho
- `other` - Outro

### Gêneros Disponíveis

- `male` - Macho
- `female` - Fêmea

### Tipos de Documento

- `cpf` - CPF
- `cnpj` - CNPJ
- `rg` - RG
- `passport` - Passaporte

## 🔄 Endpoints Organizados

### Customers Collection

| # | Método | Endpoint | Descrição |
|---|--------|----------|-----------|
| 1 | POST | `/customers` | Criar customer |
| 2 | GET | `/customers?page=1&limit=10` | Listar (paginado) |
| 3 | GET | `/customers/all` | Listar (simples) |
| 4 | GET | `/customers/:id` | Buscar por ID |
| 5 | GET | `/customers/email/:email` | Buscar por email |
| 6 | PUT | `/customers/:id` | Atualizar |
| 7 | PUT | `/customers/:id` | Atualizar senha |
| 8 | DELETE | `/customers/:id` | Deletar |

### Pets Collection

| # | Método | Endpoint | Descrição |
|---|--------|----------|-----------|
| 1 | POST | `/pets` | Criar pet (Dog) |
| 2 | POST | `/pets` | Criar pet (Cat) |
| 3 | POST | `/pets` | Criar pet (Bird) |
| 4 | GET | `/pets?page=1&limit=10` | Listar (paginado) |
| 5 | GET | `/pets/all` | Listar (simples) |
| 6 | GET | `/pets/:id` | Buscar por ID |
| 7 | GET | `/pets/customer/:customerId` | Buscar por customer |
| 8 | PUT | `/pets/:id` | Atualizar (parcial) |
| 9 | PUT | `/pets/:id` | Atualizar (completo) |
| 10 | DELETE | `/pets/:id` | Deletar |

## 🔐 Autenticação

Todos os endpoints requerem autenticação JWT no header:

```
Authorization: Bearer {{accessToken}}
```

As collections já incluem este header automaticamente usando a variável `{{accessToken}}`.

## 📊 Paginação

Endpoints paginados aceitam query params:

- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 10, máximo: 100)

**Exemplo:**
```
GET /customers?page=2&limit=20
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 2,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

## 🆘 Troubleshooting

### Erro 401 Unauthorized
- Verifique se o `accessToken` está configurado corretamente
- Verifique se o token não expirou (faça login novamente)

### Erro 404 Not Found
- Verifique se as variáveis `customerId` e `petId` estão corretas
- Verifique se o recurso ainda existe (pode ter sido deletado)

### Erro 400 Bad Request
- Verifique o formato do JSON no body
- Verifique se todos os campos obrigatórios foram preenchidos
- Veja a mensagem de erro para mais detalhes

## 📝 Notas

- As collections incluem exemplos de dados completos
- Todos os campos opcionais estão documentados
- Os IDs são UUIDs gerados automaticamente
- Senhas são automaticamente criptografadas
- Datas devem estar no formato ISO 8601 (YYYY-MM-DD)

## 🔗 Links Úteis

- [Documentação da API](../../guides/PET-CUSTOMER-API.md)
- [Guia de Endpoints](../../guides/ENDPOINTS-SUMMARY.md)
- [Arquitetura](../../guides/RESUMO-ARQUITETURA.md)

