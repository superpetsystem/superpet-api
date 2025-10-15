# 🧪 Testes de Automação - SuperPet API

Testes automatizados end-to-end para validar os endpoints da API.

---

## 📋 Arquivos

### `auth.test.js`
Testa **todos** os endpoints do módulo de autenticação:

#### Testes de Sucesso (Happy Path)
1. ✅ Register - Criar nova conta
2. ✅ Login - Fazer login
3. ✅ Get Profile (Me) - Obter dados do usuário
4. ✅ Change Password - Trocar senha (autenticado)
5. ✅ Login com nova senha
6. ✅ Refresh Token - Renovar tokens
7. ✅ Forgot Password - Solicitar recuperação
8. ✅ Reset Password - Resetar com token
9. ✅ Logout - Fazer logout
10. ✅ Token invalidado após logout
11. ✅ Login após logout

#### Testes de Erro (Validações)
12. ❌ Email duplicado (409)
13. ❌ Credenciais inválidas (401)
14. ❌ Acesso sem token (401)
15. ❌ Senha atual incorreta (401)
16. ❌ Token de reset inválido (400)

**Total: 16 testes**

---

## 🚀 Como Executar

### Pré-requisitos

1. **Servidor deve estar rodando:**
```bash
npm run start:local
```

2. **Banco de dados configurado e migrations aplicadas:**
```bash
npm run migration:apply:all:local
```

### Executar Testes

#### Método 1: Script NPM (Recomendado)
```bash
npm run test:automation
```

#### Método 2: Node Direto
```bash
node test/automation/auth.test.js
```

---

## 📊 Output Esperado

```
================================================================================
🧪 INICIANDO TESTES DE AUTOMAÇÃO - MÓDULO AUTH
SuperPet API
================================================================================
Base URL: http://localhost:3000
Test User Email: teste1729000000000@superpet.com

================================================================================
TEST 1: POST /auth/register - Registrar novo usuário
================================================================================
✅ PASSOU: Registro de usuário
   User ID: 9b1deb4d-93df-4ad1-a2a2-fc0c2fc98c01
   Email: teste1729000000000@superpet.com
   Name: Usuário Teste Automação
   Access Token: eyJhbGciOiJIUzI1NiI...

================================================================================
TEST 2: POST /auth/login - Fazer login
================================================================================
✅ PASSOU: Login
   Access Token atualizado: eyJhbGciOiJIUzI1NiI...

[... mais testes ...]

================================================================================
📊 RESUMO DOS TESTES
================================================================================
Total de testes: 16
✅ Passaram: 16
❌ Falharam: 0
Taxa de sucesso: 100.00%
================================================================================
🎉 TODOS OS TESTES PASSARAM!
================================================================================
```

---

## 🔧 Configuração

### Alterar Base URL

Edite o arquivo `auth.test.js`:

```javascript
const BASE_URL = 'http://localhost:3000';  // Local
// const BASE_URL = 'https://staging.superpet.com';  // Staging
// const BASE_URL = 'https://api.superpet.com';  // Production
```

### Fornecer Reset Token

Para testar o endpoint `reset-password`:

1. Execute até o teste 7 (Forgot Password)
2. Copie o token do console do servidor
3. Edite `auth.test.js`:
```javascript
let resetToken = 'COLE_O_TOKEN_AQUI';
```
4. Execute novamente

Ou deixe vazio para pular este teste:
```javascript
let resetToken = '';  // Teste será pulado
```

---

## 📝 Estrutura dos Testes

### Cada teste:

1. **Descrição:** O que está sendo testado
2. **Request:** Faz requisição HTTP
3. **Validações:** Verifica status e response
4. **Success/Error:** Log colorido do resultado
5. **Return:** `true` se passou, `false` se falhou

### Exemplo de Teste:

```javascript
async function test1_Register() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    
    // Validações
    if (response.status !== 201) {
      throw new Error('Status incorreto');
    }
    
    if (!response.data.accessToken) {
      throw new Error('Token não retornado');
    }
    
    // Salvar tokens para próximos testes
    accessToken = response.data.accessToken;
    
    logSuccess('Registro de usuário');
    return true;
  } catch (error) {
    logError('Registro de usuário', error);
    return false;
  }
}
```

---

## 🎯 Casos de Uso

### Desenvolvimento Local

Execute após cada mudança no módulo de Auth:

```bash
# 1. Fazer mudanças no código
# 2. Aplicar migrations se necessário
npm run migration:apply:all:local

# 3. Reiniciar servidor
# Ctrl+C
npm run start:local

# 4. Executar testes
npm run test:automation
```

### CI/CD Pipeline

Adicione ao pipeline:

```yaml
# .github/workflows/test.yml
- name: Run E2E Tests
  run: |
    npm run start:local &
    sleep 10
    npm run test:automation
```

### Antes de Commit

```bash
# Verificar se tudo funciona
npm run test:automation

# Se passou, commit
git add .
git commit -m "feat: ..."
```

---

## 🔍 Troubleshooting

### Erro: "ECONNREFUSED"

**Causa:** Servidor não está rodando

**Solução:**
```bash
npm run start:local
# Aguarde iniciar
npm run test:automation
```

### Erro: "AxiosError: Request failed with status code 500"

**Causa:** Erro no servidor (bug no código)

**Solução:**
1. Verifique os logs do servidor
2. Corrija o bug
3. Execute novamente

### Testes falhando aleatoriamente

**Causa:** Banco de dados com dados antigos

**Solução:**
```bash
# Resetar banco
npm run migration:revert:local
npm run migration:apply:all:local

# Executar testes
npm run test:automation
```

### Teste "Reset Password" sempre pulado

**Causa:** `resetToken` vazio

**Solução:**
1. Execute teste manualmente até o passo 7
2. Copie token do console
3. Cole no código: `let resetToken = 'TOKEN_AQUI';`
4. Execute novamente

---

## 🚀 Melhorias Futuras

### 1. Integração com Jest

```javascript
describe('Auth Module', () => {
  it('should register user', async () => {
    // ...
  });
});
```

### 2. Fixtures e Factories

```javascript
const UserFactory = {
  create: () => ({
    email: `user${Date.now()}@test.com`,
    password: 'senha123',
    name: 'Test User'
  })
};
```

### 3. Database Seeding/Cleanup

```javascript
beforeAll(async () => {
  // Limpar banco antes dos testes
});

afterAll(async () => {
  // Limpar dados de teste
});
```

### 4. Testes Paralelos

```javascript
// Executar testes independentes em paralelo
await Promise.all([
  testEndpoint1(),
  testEndpoint2(),
  testEndpoint3(),
]);
```

### 5. Relatórios HTML

```bash
# Gerar relatório visual
npm run test:automation --reporter html
```

---

## 📚 Links Relacionados

- [README Principal](../../README.md)
- [Collection Postman](../../docs/collections/auth/)
- [Guia de Testes](../../docs/guides/TESTING.md) (futuro)

---

Desenvolvido com ❤️ para SuperPet API

