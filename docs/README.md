# 📚 Documentação - SuperPet API

Bem-vindo à documentação completa do projeto SuperPet API!

---

## 📖 Guias

### 🌍 [Guia de Ambientes](./guides/ENVIRONMENTS.md)
Aprenda a configurar e gerenciar diferentes ambientes:
- Configuração de `.env` para local, staging e production
- Como gerar secrets seguros
- Boas práticas de segurança
- Troubleshooting

### 🔐 [Recuperação e Troca de Senha](./guides/PASSWORD-RECOVERY.md)
Entenda os dois fluxos de gerenciamento de senhas:
- Change Password (usuário autenticado)
- Forgot/Reset Password (sem autenticação)
- Segurança e boas práticas
- Como testar em desenvolvimento

### 🔄 [Guia de Migrations](./guides/MIGRATIONS.md)
Tudo sobre migrations do banco de dados:
- Como criar e gerar migrations
- Comandos para cada ambiente
- Fluxo de trabalho recomendado
- Exemplos práticos
- Boas práticas

### 📋 [Comandos de Migrations](./guides/MIGRATION-COMMANDS.md)
Referência rápida de comandos:
- Aplicar TODAS as migrations de uma vez
- Ver migrations pendentes
- Comandos para cada ambiente
- Fluxo completo de deploy
- FAQ e troubleshooting

### 🔄 [Fluxo de Trabalho com Migrations](./guides/MIGRATIONS-WORKFLOW.md)
Guia prático e completo do dia-a-dia com migrations:
- Criar nova entity
- Adicionar/remover campos
- Modificar campos existentes
- Workflow completo de deploy
- Troubleshooting detalhado

### 📜 [Guia de Scripts](./guides/SCRIPTS.md)
Referência completa de todos os scripts NPM:
- Scripts de desenvolvimento
- Scripts de migrations
- Scripts de testes
- Fluxos de trabalho comuns
- Debug e troubleshooting

---

## 📦 Collections & Exemplos

### 🚀 [Collection Postman - Auth Module](./collections/auth/)
Collection completa do Postman para testar autenticação:
- 8 endpoints completos
- Exemplos de success e error responses
- Scripts automáticos para salvar tokens
- Variáveis pré-configuradas
- Documentação inline

**Como usar:**
1. Importe `SuperPet-Auth.postman_collection.json` no Postman
2. Configure `baseUrl` se necessário
3. Execute em ordem: Register → Login → Me → etc
4. Tokens são salvos automaticamente!

### 🌐 [Exemplos HTTP](./collections/api-examples.http)
Exemplos prontos para usar com REST Client (VS Code):
- Registro de usuário
- Login
- Refresh token
- Logout
- Ver perfil
- Trocar senha
- Recuperação de senha

---

## 🧪 Testes de Automação

### [Testes de Auth](../test/automation/)
Scripts de automação para testar todos os endpoints:
- 16 testes automatizados
- Casos de sucesso e erro
- Validação completa do módulo Auth
- Execute com: `npm run test:automation`

---

## 🚀 Quick Start

### 1. Configurar Ambiente

```bash
# Copiar template
cp env/template.env env/local.env

# Editar configurações
# Configurar banco de dados, JWT secrets, etc.
```

### 2. Configurar Banco de Dados

```sql
CREATE DATABASE superpet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Executar Migrations

```bash
npm run migration:apply:all:local
```

### 4. Iniciar Aplicação

```bash
npm run start:local
```

### 5. Testar API

**Opção 1: Postman**
- Importe `docs/collections/auth/SuperPet-Auth.postman_collection.json`
- Execute as requests

**Opção 2: REST Client (VS Code)**
- Abra `docs/collections/api-examples.http`
- Clique em "Send Request"

---

## 📖 Estrutura da Documentação

```
docs/
├── README.md                              # Este arquivo - índice da documentação
├── guides/                                # Guias e tutoriais
│   ├── ENVIRONMENTS.md                   # Guia de ambientes
│   ├── MIGRATIONS.md                     # Guia de migrations
│   ├── MIGRATION-COMMANDS.md             # Comandos de migrations
│   ├── MIGRATIONS-WORKFLOW.md            # Workflow de migrations
│   ├── PASSWORD-RECOVERY.md              # Recuperação de senha
│   └── SCRIPTS.md                        # Guia de scripts
└── collections/                           # Collections e exemplos
    ├── auth/                              # Collection do módulo Auth
    │   ├── SuperPet-Auth.postman_collection.json
    │   └── README.md                      # Como usar a collection
    └── api-examples.http                  # Exemplos REST Client
```

---

## 🔗 Links Úteis

### Documentação Externa
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Postman Documentation](https://learning.postman.com/)

### Recursos do Projeto
- [README Principal](../README.md)
- [Pasta de Ambientes](../env/)
- [Código Fonte](../src/)

---

## 💡 Dicas Rápidas

### Desenvolvimento Local
```bash
npm run start:local                # Iniciar em modo local
npm run migration:pending:local    # Ver migrations pendentes
npm run migration:apply:all:local  # Aplicar todas migrations
```

### Testar API
```bash
# Postman: Importar collection de docs/collections/auth/
# REST Client: Abrir docs/collections/api-examples.http
```

### Criar Nova Feature
```bash
# 1. Criar/modificar entities
# 2. Gerar migration
npm run migration:generate:local src/database/migrations/NomeDaFeature

# 3. Aplicar migration
npm run migration:apply:all:local

# 4. Testar
npm run test
```

### Deploy
```bash
# Ver pendentes
npm run migration:pending:staging

# Aplicar todas
npm run migration:apply:all:staging

# Iniciar
npm run start:staging
```

---

## 🆘 Precisa de Ajuda?

1. **Problemas com ambiente?** → [ENVIRONMENTS.md](./guides/ENVIRONMENTS.md#troubleshooting)
2. **Problemas com migrations?** → [MIGRATIONS.md](./guides/MIGRATIONS.md#troubleshooting)
3. **Dúvidas sobre comandos?** → [SCRIPTS.md](./guides/SCRIPTS.md)
4. **Como testar Auth?** → [Collection Postman](./collections/auth/README.md)

---

## ✨ Contribuindo

Ao contribuir com documentação:
1. Mantenha o padrão de formatação
2. Adicione exemplos práticos
3. Atualize o índice quando necessário
4. Use emojis para melhor visualização
5. Teste os comandos antes de documentar
6. Salve exemplos de response nas collections

---

Desenvolvido com ❤️ para SuperPet API
