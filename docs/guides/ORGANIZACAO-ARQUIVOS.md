# 📁 Organização de Arquivos - SuperPet API

Este documento descreve a estrutura organizada dos arquivos de testes e collections do Postman.

## 🧪 Testes Automatizados

### Estrutura
```
test/automation/
├── auth/
│   ├── auth.test.js              (17 testes)
│   └── README.md
├── customers/
│   ├── customers.test.js         (11 testes)
│   └── README.md
├── pets/
│   ├── pets.test.js              (14 testes)
│   └── README.md
├── run-all-tests.js              (executa todos)
└── README.md
```

### Executar Testes

#### Testes Individuais
```bash
# Auth (17 testes + 100 users)
node test/automation/auth/auth.test.js

# Customers (11 testes + 100 customers)
node test/automation/customers/customers.test.js

# Pets (14 testes + 100 pets)
node test/automation/pets/pets.test.js
```

#### Todos os Testes
```bash
node test/automation/run-all-tests.js
```

---

## 📬 Collections do Postman

### Estrutura
```
docs/collections/postman/
├── auth/                          (futuro)
│   └── README.md
├── customers/
│   ├── SuperPet-Customers.postman_collection.json
│   └── README.md
├── pets/
│   ├── SuperPet-Pets.postman_collection.json
│   └── README.md
├── SuperPet-Environment.postman_environment.json
└── README.md
```

### Arquivos

#### 1. Customers Collection
- **Arquivo**: `customers/SuperPet-Customers.postman_collection.json`
- **Endpoints**: 8 requests
- **Features**: Exemplos de responses, variáveis dinâmicas

#### 2. Pets Collection
- **Arquivo**: `pets/SuperPet-Pets.postman_collection.json`
- **Endpoints**: 10 requests
- **Features**: Exemplos de responses, múltiplos tipos de pets

#### 3. Environment
- **Arquivo**: `SuperPet-Environment.postman_environment.json`
- **Variáveis**: baseUrl, accessToken, customerId, petId

---

## 📚 Documentação

### Estrutura
```
docs/
├── collections/
│   ├── postman/
│   │   ├── auth/
│   │   ├── customers/
│   │   ├── pets/
│   │   └── SuperPet-Environment.postman_environment.json
│   └── pets-customers.http        (HTTP files)
└── guides/
    ├── ARCHITECTURE.md            (Arquitetura geral)
    ├── ENDPOINTS-SUMMARY.md       (Resumo de endpoints)
    ├── ORGANIZACAO-ARQUIVOS.md    (este arquivo)
    ├── PET-CUSTOMER-API.md        (Documentação completa)
    ├── RESUMO-ARQUITETURA.md      (Resumo executivo)
    └── ... (outros guias)
```

---

## 🎯 Benefícios da Organização

### ✅ Separação por Módulo
- Cada módulo tem sua própria pasta
- Fácil localização de arquivos
- Manutenção simplificada

### ✅ READMEs Específicos
- Cada pasta tem seu README
- Documentação contextual
- Instruções específicas

### ✅ Escalabilidade
- Fácil adicionar novos módulos
- Padrão consistente
- Estrutura clara

### ✅ Facilidade de Uso
- Imports organizados no Postman
- Testes executáveis individualmente
- Script para rodar todos os testes

---

## 📊 Estatísticas

### Testes Automatizados
| Módulo | Arquivo | Testes | Criação em Massa |
|--------|---------|--------|------------------|
| **Auth** | `auth/auth.test.js` | 17 | 100 users |
| **Customers** | `customers/customers.test.js` | 11 | 100 customers |
| **Pets** | `pets/pets.test.js` | 14 | 100 pets |
| **TOTAL** | 3 arquivos | **42** | **300 registros** |

### Collections Postman
| Módulo | Arquivo | Requests |
|--------|---------|----------|
| **Customers** | `customers/SuperPet-Customers.postman_collection.json` | 8 |
| **Pets** | `pets/SuperPet-Pets.postman_collection.json` | 10 |
| **TOTAL** | 2 arquivos | **18** |

---

## 🚀 Quick Start

### 1. Importar Collections no Postman
```bash
1. Abra Postman
2. Import > Upload Files
3. Selecione:
   - docs/collections/postman/customers/SuperPet-Customers.postman_collection.json
   - docs/collections/postman/pets/SuperPet-Pets.postman_collection.json
   - docs/collections/postman/SuperPet-Environment.postman_environment.json
4. Configure environment "SuperPet - Local"
5. Adicione seu accessToken
```

### 2. Executar Testes
```bash
# Rodar todos os testes
node test/automation/run-all-tests.js

# Ou individual
node test/automation/auth/auth.test.js
node test/automation/customers/customers.test.js
node test/automation/pets/pets.test.js
```

---

## 📝 Convenções

### Nomenclatura de Arquivos
- **Testes**: `{modulo}.test.js`
- **Collections**: `SuperPet-{Modulo}.postman_collection.json`
- **READMEs**: Sempre maiúsculas `README.md`

### Estrutura de Pastas
- **Testes**: `test/automation/{modulo}/`
- **Collections**: `docs/collections/postman/{modulo}/`
- **Guias**: `docs/guides/`

### Padrões
- 1 pasta = 1 módulo
- 1 README por pasta
- Exemplos de responses em todas as collections
- Logs coloridos nos testes (✅ ❌ ⚠️)

---

## 🔄 Manutenção

### Adicionar Novo Módulo

1. **Criar Pasta de Teste**
```bash
New-Item -ItemType Directory -Path "test/automation/{novo-modulo}" -Force
```

2. **Criar Arquivo de Teste**
```bash
test/automation/{novo-modulo}/{novo-modulo}.test.js
test/automation/{novo-modulo}/README.md
```

3. **Criar Collection Postman**
```bash
docs/collections/postman/{novo-modulo}/SuperPet-{NovoModulo}.postman_collection.json
docs/collections/postman/{novo-modulo}/README.md
```

4. **Adicionar ao run-all-tests.js**
```javascript
{ path: '{novo-modulo}/{novo-modulo}.test.js', name: '{NovoModulo} Module' }
```

---

## 🎉 Resultado

✅ **Testes organizados** por módulo  
✅ **Collections organizadas** por módulo  
✅ **READMEs específicos** em cada pasta  
✅ **Script executor** para todos os testes  
✅ **300 registros** criados em massa nos testes  
✅ **100% de sucesso** em todos os testes  

**Estrutura profissional e escalável!** 🚀

