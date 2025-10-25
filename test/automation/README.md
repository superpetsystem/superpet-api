# 🧪 Automação de Testes - SuperPet API

## 📋 Visão Geral

Este diretório contém testes automatizados end-to-end para a API SuperPet, validando todos os módulos e funcionalidades do sistema.

## 🚀 Como Executar os Testes

### Opção 1: Rodar Testes do Zero (Recomendado)

Este comando **reseta o banco completamente** e roda todos os testes:

```bash
npm run test:automation:all:from-scratch
```

**O que este comando faz:**
1. 🗑️ Limpa todas as tabelas do banco de dados
2. 👤 Recria o usuário SUPER_ADMIN
3. ⏳ Aguarda estabilização do ambiente
4. 🧪 Executa todos os testes automaticamente

### Opção 2: Rodar Testes com Banco Existente

Se o banco já está configurado e você só quer rodar os testes:

```bash
npm run test:automation:all
```

### Opção 3: Resetar Banco Apenas

Para limpar o banco sem rodar os testes:

```bash
npm run test:database:reset
```

## 📦 Pré-requisitos

1. **API rodando em modo local:**
   ```bash
   npm run start:local
   ```

2. **Banco de dados criado:**
   - Database: `superpet_test`
   - Migrations aplicadas: `npm run database:migration:run:local`

3. **Configuração do banco:**
   - Host: `localhost`
   - Port: `3306`
   - User: `root`
   - Password: `root`

## 🧩 Módulos Testados

### ✅ Módulos Core
- **Auth** - Autenticação, registro, login, troca de senha, recuperação
- **Organizations** - Gerenciamento de organizações e planos SaaS
- **Employees** - Gestão de funcionários e controle de acesso
- **Stores** - Lojas, horários, capacidade e features
- **Customers** - Clientes e endereços
- **Pets** - Gestão de pets e seus dados
- **Services** - Serviços padrão e customizados

### ✅ Novos Módulos
- **Admin** - SUPER_ADMIN, orquestração de features
- **Bookings** - Sistema de agendamentos online
- **Veterinary** - Prontuários e vacinações
- **Inventory** - Gestão de estoque e produtos
- **Reports** - Analytics e relatórios de BI

### ✅ Validações SaaS
- **Multi-Tenant** - Isolamento de dados entre organizações
- **Role-Based Access** - SUPER_ADMIN, OWNER, ADMIN, STAFF, VIEWER
- **Feature Toggling** - Habilitação dinâmica de funcionalidades
- **Plan Limits** - Validação de limites por plano

## 📊 Estrutura de Testes

```
test/automation/
├── README.md                      # Este arquivo
├── run-from-scratch.js           # 🚀 Executa tudo do zero
├── run-all-tests.js              # Orquestrador de testes
├── reset-database.js             # Limpa o banco
│
├── helpers/
│   ├── superadmin-login.js       # Login do SUPER_ADMIN
│   └── ...
│
├── auth/
│   └── auth.test.js              # Testes de autenticação
│
├── saas/
│   ├── saas-isolation.test.js    # Isolamento multi-tenant
│   ├── saas-limits.test.js       # Limites de planos
│   ├── saas-roles.test.js        # Controle de acesso
│   └── saas-new-features.test.js # Features novas (Bookings, Vet, etc)
│
├── modules/
│   ├── admin.test.js             # Admin & Feature Orchestration
│   ├── bookings.test.js          # Sistema de agendamentos
│   ├── veterinary.test.js        # Prontuários veterinários
│   ├── inventory.test.js         # Gestão de estoque
│   ├── reports.test.js           # Reports & Analytics
│   ├── organizations.test.js     # Organizações
│   ├── employees.test.js         # Funcionários
│   ├── stores.test.js            # Lojas
│   ├── customers.test.js         # Clientes
│   ├── pets.test.js              # Pets
│   └── services.test.js          # Serviços
│
└── utils/
    └── ...
```

## 🔧 Configuração do SUPER_ADMIN

Os testes criam automaticamente um usuário SUPER_ADMIN:

```javascript
{
  id: '00000000-0000-0000-0000-000000000000',
  email: 'superadmin@superpet.com.br',
  password: 'Super@2024!Admin',
  role: 'SUPER_ADMIN'
}
```

## 📝 Convenções de Teste

### Ordem de Execução
1. Auth (login, tokens)
2. SaaS Isolation (multi-tenant)
3. SaaS Limits (planos)
4. SaaS Roles (RBAC)
5. Organizations
6. Employees
7. Stores
8. Customers
9. Pets
10. Services
11. Admin (SUPER_ADMIN features)
12. Bookings
13. Veterinary
14. Inventory
15. Reports
16. SaaS New Features (testes integrados)

### Padrões de Resposta
- **201** - Created (sucesso na criação)
- **200** - OK (sucesso geral)
- **400** - Bad Request (dados inválidos)
- **401** - Unauthorized (não autenticado)
- **403** - Forbidden (sem permissão)
- **404** - Not Found (não encontrado)

### Variáveis Globais
Os testes salvam IDs importantes para uso posterior:
- `SUPERADMIN_TOKEN` - Token do SUPER_ADMIN
- `ORG1_ID`, `ORG2_ID` - IDs das organizações
- `OWNER1_ID`, `ADMIN1_ID`, etc - IDs de usuários
- `STORE1_ID`, `STORE2_ID` - IDs das lojas
- E muitos outros...

## 🐛 Troubleshooting

### Erro: "connect ECONNREFUSED"
➡️ API não está rodando. Execute: `npm run start:local`

### Erro: "ER_NO_SUCH_TABLE"
➡️ Migrations não aplicadas. Execute: `npm run database:migration:run:local`

### Erro: "Database does not exist"
➡️ Criar o banco: `CREATE DATABASE superpet_test;`

### Erro: "Invalid credentials" no SUPER_ADMIN
➡️ Execute o reset completo: `npm run test:automation:all:from-scratch`

### Testes falhando por ordem
➡️ Use sempre `npm run test:automation:all:from-scratch` para garantir estado limpo

## 🎯 Boas Práticas

1. **Sempre use `npm run test:automation:all:from-scratch`** para garantir que o banco está limpo
2. **Não modifique o banco manualmente** durante os testes
3. **Aguarde API estar pronta** antes de rodar testes
4. **Rode todos os testes** após mudanças no código
5. **Verifique isolamento** - testes não devem depender uns dos outros

## 📈 Cobertura

Os testes cobrem:
- ✅ Autenticação e autorização
- ✅ Multi-tenant e isolamento
- ✅ CRUD completo de todas entidades
- ✅ Validações de negócio
- ✅ Controle de permissões (RBAC)
- ✅ Limites de planos SaaS
- ✅ Feature toggling
- ✅ Edge cases e cenários de erro

## 🚦 Status dos Testes

Execute `npm run test:automation:all:from-scratch` para ver o status completo de todos os módulos!

---

**Desenvolvido com ❤️ pela equipe SuperPet**
