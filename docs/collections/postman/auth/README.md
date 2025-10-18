# 📦 Collection Postman - Auth Module

Collection completa para testar todos os endpoints do módulo de autenticação da SuperPet API.

---

## 📥 Como Importar

### 1. Baixar o Arquivo

O arquivo da collection está em:
```
docs/collections/auth/SuperPet-Auth.postman_collection.json
```

### 2. Importar no Postman

1. Abra o Postman
2. Clique em **Import** (canto superior esquerdo)
3. Arraste o arquivo `SuperPet-Auth.postman_collection.json`
4. Ou clique em **Choose Files** e selecione o arquivo
5. Clique em **Import**

### 3. Configurar Variáveis

A collection já vem com variáveis pré-configuradas:

| Variável | Valor Padrão | Descrição |
|----------|--------------|-----------|
| `baseUrl` | `http://localhost:3000` | URL da API |
| `accessToken` | (vazio) | Preenchido automaticamente após login |
| `refreshToken` | (vazio) | Preenchido automaticamente após login |
| `userId` | (vazio) | Preenchido automaticamente após login |

**Para mudar a URL:**
1. Clique na collection "SuperPet API - Auth Module"
2. Vá em **Variables**
3. Altere `baseUrl` para seu ambiente

---

## 🎯 Endpoints Inclusos

### 🔓 Públicos (sem autenticação)

1. **Register** - Criar nova conta
2. **Login** - Fazer login
3. **Forgot Password** - Solicitar recuperação de senha
4. **Reset Password** - Resetar senha com token
5. **Refresh Token** - Renovar tokens

### 🔒 Protegidos (requer token)

6. **Get Profile (Me)** - Ver dados do usuário
7. **Change Password** - Trocar senha (autenticado)
8. **Logout** - Fazer logout

---

## 🚀 Como Usar

### Fluxo Recomendado:

#### 1. **Registrar Usuário**
```
POST /auth/register
```
- Crie uma conta nova
- Os tokens são salvos automaticamente nas variáveis
- ✅ Pronto para usar endpoints autenticados!

#### 2. **Ver Perfil**
```
GET /auth/me
```
- Usa automaticamente o `{{accessToken}}` salvo
- Retorna dados do usuário

#### 3. **Trocar Senha (Autenticado)**
```
PATCH /auth/change-password
```
- Informa senha atual + nova senha
- Usa token JWT

#### 4. **Logout**
```
POST /auth/logout
```
- Invalida refresh token

#### 5. **Login Novamente**
```
POST /auth/login
```
- Faça login com as novas credenciais

---

### Testando Recuperação de Senha:

#### 1. **Solicitar Reset**
```
POST /auth/forgot-password
```
- Informa email
- Token aparece no console do servidor

#### 2. **Copiar Token**
No console do servidor, você verá:
```
================================================================================
🔐 PASSWORD RESET TOKEN (APENAS PARA DESENVOLVIMENTO)
================================================================================
Email: teste@superpet.com
Token: a1b2c3d4e5f6... ← COPIE ESTE TOKEN
Expires: 2025-10-14T20:00:00.000Z
================================================================================
```

#### 3. **Resetar Senha**
```
POST /auth/reset-password
```
- Cole o token no campo `token`
- Informe nova senha
- ✅ Senha resetada!

---

## ✨ Recursos da Collection

### 1. **Auto-Save de Tokens** 🤖

Após login ou register, os tokens são salvos automaticamente:

```javascript
// Script automático após Login/Register
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set('accessToken', response.accessToken);
    pm.collectionVariables.set('refreshToken', response.refreshToken);
    pm.collectionVariables.set('userId', response.user.id);
}
```

### 2. **Exemplos de Resposta** 📄

Cada endpoint tem exemplos de:
- ✅ Resposta de sucesso
- ❌ Respostas de erro comuns

### 3. **Descrições Detalhadas** 📝

Cada request tem documentação explicando:
- O que faz
- Parâmetros necessários
- Validações
- Comportamento esperado

---

## 🧪 Testando Todos os Fluxos

### Fluxo Completo 1: Registro → Uso → Logout

```
1. Register          → Cria conta e salva tokens
2. Get Profile       → Vê dados do usuário
3. Change Password   → Troca senha
4. Logout            → Invalida tokens
5. Login             → Login com nova senha
```

### Fluxo Completo 2: Esqueceu Senha

```
1. Forgot Password   → Solicita reset (token no console)
2. [Copiar token]    → Do console do servidor
3. Reset Password    → Define nova senha
4. Login             → Login com senha resetada
```

### Fluxo Completo 3: Refresh Token

```
1. Login             → Obtém tokens
2. [Esperar 15min]   → AccessToken expira
3. Refresh Token     → Renova accessToken
4. Get Profile       → Usa novo accessToken
```

---

## 📋 Variáveis de Ambiente

### Configurar Múltiplos Ambientes

Você pode criar environments no Postman:

#### Local
```
baseUrl = http://localhost:3000
```

#### Staging
```
baseUrl = https://staging.superpet.com
```

#### Production
```
baseUrl = https://api.superpet.com
```

**Como criar:**
1. Clique no ícone de "olho" (Environments)
2. Clique em **Add**
3. Nomeie (ex: "Local", "Staging")
4. Adicione variável `baseUrl`
5. Selecione o environment antes de testar

---

## 🔧 Troubleshooting

### Erro 401: Unauthorized

**Causa:** Token expirou ou inválido

**Solução:**
1. Faça login novamente: `POST /auth/login`
2. Ou use refresh token: `POST /auth/refresh`

### Tokens não são salvos automaticamente

**Solução:**
1. Verifique se os scripts estão habilitados no Postman
2. Settings → General → Allow reading and writing to variable scopes

### Erro 409: Email já registrado

**Solução:**
1. Use outro email
2. Ou delete o usuário do banco de dados

### Token de reset não funciona

**Solução:**
1. Token expira em 1 hora
2. Solicite novo: `POST /auth/forgot-password`
3. Copie token do console do servidor
4. Use imediatamente

---

## 📚 Ordem Recomendada para Testes

### Primeira Vez:

1. ✅ **Register** - Criar conta
2. ✅ **Get Profile (Me)** - Ver dados
3. ✅ **Change Password** - Trocar senha
4. ✅ **Logout** - Sair
5. ✅ **Login** - Login com nova senha
6. ✅ **Refresh Token** - Renovar tokens
7. ✅ **Forgot Password** - Solicitar reset
8. ✅ **Reset Password** - Usar token

---

## 🔗 Links Relacionados

- [README Principal](../../../README.md)
- [Guia de Recuperação de Senha](../../guides/PASSWORD-RECOVERY.md)
- [API Examples HTTP](../api-examples.http)

---

## 💡 Dicas

### 1. Use Scripts nos Testes

Os scripts pós-request salvam tokens automaticamente. Aproveite!

### 2. Organize em Pastas

No Postman, você pode criar pastas dentro da collection:
- 📁 Authentication
- 📁 Profile Management
- 📁 Password Management

### 3. Use Environments

Crie environments para Local, Staging e Production.

### 4. Salve Exemplos

Após fazer requests bem-sucedidos, salve como exemplos:
- Click direito na request → **Add Example**

---

Desenvolvido com ❤️ para SuperPet API

