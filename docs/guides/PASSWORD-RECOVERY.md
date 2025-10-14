# 🔐 Recuperação e Troca de Senha - SuperPet API

Este documento explica os dois fluxos diferentes para gerenciamento de senhas na aplicação.

---

## 📋 Dois Fluxos Distintos

### 1️⃣ Change Password (Usuário Logado)

**Cenário:** Usuário está autenticado e quer trocar a senha.

**Endpoint:** `PATCH /auth/change-password`

**Requer:** 
- ✅ JWT Token (usuário autenticado)
- ✅ Senha atual
- ✅ Nova senha

**Fluxo:**
```
1. Usuário logado acessa "Trocar Senha"
2. Informa senha atual + nova senha
3. Sistema valida senha atual
4. Sistema atualiza para nova senha
5. ✅ Senha trocada!
```

---

### 2️⃣ Forgot/Reset Password (Sem Autenticação)

**Cenário:** Usuário esqueceu a senha e não consegue fazer login.

**Endpoints:** 
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

**Requer:**
- ❌ Não precisa estar autenticado
- ✅ Email cadastrado
- ✅ Token temporário válido

**Fluxo:**
```
1. Usuário clica "Esqueci minha senha"
2. Informa email → POST /auth/forgot-password
3. Sistema gera token temporário (válido 1h)
4. 📧 Token enviado por email (em dev: aparece no console)
5. Usuário acessa link com token
6. Informa nova senha → POST /auth/reset-password
7. ✅ Senha resetada!
```

---

## 🔧 Implementação Técnica

### Change Password (Autenticado)

#### Request:
```http
PATCH /auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "senhaAtual123",
  "newPassword": "novaSenha456"
}
```

#### Validações:
1. ✅ JWT válido
2. ✅ Usuário existe
3. ✅ Senha atual está correta
4. ✅ Nova senha tem mínimo 6 caracteres

#### Response (200 OK):
```json
{
  "message": "Password changed successfully"
}
```

#### Erros Possíveis:
- **401 Unauthorized:** Token inválido ou expirado
- **401 Unauthorized:** Senha atual incorreta
- **400 Bad Request:** Validação falhou (senha muito curta, etc)

---

### Forgot Password

#### Request:
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Processo:
1. Busca usuário por email
2. Gera token aleatório de 32 bytes
3. Armazena hash do token no banco
4. Define expiração (1 hora)
5. **Desenvolvimento:** Imprime token no console
6. **Produção:** Envia email com link

#### Response (200 OK):
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**⚠️ Segurança:** Sempre retorna sucesso, mesmo se email não existir. Isso evita que atacantes descubram quais emails estão cadastrados.

#### Console Output (Desenvolvimento):
```
================================================================================
🔐 PASSWORD RESET TOKEN (APENAS PARA DESENVOLVIMENTO)
================================================================================
Email: user@example.com
Token: a1b2c3d4e5f6...
Expires: 2025-10-14T20:00:00.000Z
================================================================================
⚠️  Em produção, este token seria enviado por EMAIL
================================================================================
```

---

### Reset Password

#### Request:
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "novaSenha123"
}
```

#### Validações:
1. ✅ Token existe no banco
2. ✅ Token não expirou (< 1 hora)
3. ✅ Hash do token corresponde
4. ✅ Nova senha válida (mín. 6 caracteres)

#### Processo:
1. Busca usuário com token válido
2. Valida token e expiração
3. Atualiza senha
4. **Limpa token de reset** (não pode reusar)
5. **Invalida refresh tokens** (segurança extra)

#### Response (200 OK):
```json
{
  "message": "Password has been reset successfully"
}
```

#### Erros Possíveis:
- **400 Bad Request:** Token inválido ou expirado
- **400 Bad Request:** Token já foi usado
- **400 Bad Request:** Senha não atende requisitos

---

## 🗄️ Banco de Dados

### Campos Adicionados na Tabela `users`:

```sql
ALTER TABLE `users` 
ADD COLUMN `resetPasswordToken` varchar(255) NULL,
ADD COLUMN `resetPasswordExpires` timestamp NULL;
```

### Campos:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `resetPasswordToken` | varchar(255) | Hash bcrypt do token de reset |
| `resetPasswordExpires` | timestamp | Data/hora de expiração (1h) |

### Valores:

- **Usuário normal:** `NULL` / `NULL`
- **Reset solicitado:** `hash_do_token` / `2025-10-14 20:00:00`
- **Reset usado:** `NULL` / `NULL` (limpa após uso)

---

## 🔒 Segurança

### ✅ Boas Práticas Implementadas:

1. **Token Aleatório Criptograficamente Seguro**
   - Usa `crypto.randomBytes(32)` 
   - 32 bytes = 256 bits de entropia

2. **Token com Hash**
   - Token em texto plano nunca é armazenado
   - Armazena apenas hash bcrypt

3. **Expiração Curta**
   - Token expira em 1 hora
   - Minimiza janela de ataque

4. **Uso Único**
   - Token é deletado após uso
   - Não pode ser reutilizado

5. **Resposta Consistente**
   - Sempre retorna sucesso (forgot-password)
   - Não revela se email existe

6. **Invalidação de Sessões**
   - Limpa refresh tokens ao resetar senha
   - Força re-login em todos dispositivos

7. **Rate Limiting (TODO)**
   - Implementar limite de tentativas
   - Evita força bruta

---

## 📧 Integração com Email (Produção)

### Exemplo de Implementação:

```typescript
// auth.service.ts - forgotPassword()

// Em produção, substituir console.log por:
await this.emailService.sendPasswordResetEmail({
  to: user.email,
  name: user.name,
  resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
  expiresIn: '1 hora',
});
```

### Template de Email:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Recuperação de Senha - SuperPet</title>
</head>
<body>
  <h1>Olá, {{name}}!</h1>
  
  <p>Você solicitou a recuperação de senha para sua conta SuperPet.</p>
  
  <p>Clique no botão abaixo para criar uma nova senha:</p>
  
  <a href="{{resetLink}}" style="...">
    Criar Nova Senha
  </a>
  
  <p>Este link expira em {{expiresIn}}.</p>
  
  <p>Se você não solicitou esta recuperação, ignore este email.</p>
  
  <p>Equipe SuperPet</p>
</body>
</html>
```

---

## 🧪 Testando em Desenvolvimento

### 1. Change Password (Autenticado)

```bash
# 1. Fazer login
POST /auth/login
{
  "email": "user@example.com",
  "password": "senhaAtual123"
}

# Copiar accessToken da resposta

# 2. Trocar senha
PATCH /auth/change-password
Authorization: Bearer {accessToken}
{
  "currentPassword": "senhaAtual123",
  "newPassword": "novaSenha456"
}

# 3. Fazer login com nova senha
POST /auth/login
{
  "email": "user@example.com",
  "password": "novaSenha456"
}
```

---

### 2. Forgot/Reset Password (Sem Autenticação)

```bash
# 1. Solicitar reset
POST /auth/forgot-password
{
  "email": "user@example.com"
}

# 2. Copiar token do console do servidor
# Output:
# Token: a1b2c3d4e5f6...

# 3. Resetar senha com token
POST /auth/reset-password
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "senhaNovissima789"
}

# 4. Fazer login com nova senha
POST /auth/login
{
  "email": "user@example.com",
  "password": "senhaNovissima789"
}
```

---

## 🎯 Casos de Uso

### Cenário 1: Usuário Quer Mudar Senha (Proativo)

**Situação:** Usuário logado quer trocar senha por segurança

**Fluxo:** Change Password
```
✅ Usuário está autenticado
✅ Sabe senha atual
→ PATCH /auth/change-password
```

---

### Cenário 2: Usuário Esqueceu Senha

**Situação:** Usuário não consegue fazer login

**Fluxo:** Forgot → Reset Password
```
❌ Usuário não está autenticado
❌ Não sabe senha atual
→ POST /auth/forgot-password (recebe token)
→ POST /auth/reset-password (usa token)
```

---

### Cenário 3: Suspeita de Comprometimento

**Situação:** Usuário acha que senha foi descoberta

**Fluxo:** Depende se consegue fazer login
```
SE consegue fazer login:
  → Change Password (mais rápido)

SE NÃO consegue fazer login:
  → Forgot/Reset Password
```

---

## 🚀 Melhorias Futuras

### 1. Rate Limiting
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(3, 60) // 3 tentativas por minuto
@Post('forgot-password')
async forgotPassword() { ... }
```

### 2. Email Service
- Integrar com SendGrid/AWS SES
- Templates HTML profissionais
- Tracking de emails

### 3. Histórico de Senhas
```typescript
// Evitar reusar últimas 5 senhas
passwordHistory: string[]
```

### 4. Requisitos de Senha Fortes
```typescript
// Validar complexidade
- Mínimo 8 caracteres
- Letra maiúscula
- Letra minúscula
- Número
- Caractere especial
```

### 5. 2FA (Two-Factor Authentication)
- TOTP (Google Authenticator)
- SMS
- Email

### 6. Logs de Segurança
```typescript
// Registrar todas tentativas
- Forgot password solicitado
- Reset password usado
- Tentativas falhadas
```

---

## 📊 Diagrama de Fluxos

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO 1: Change Password                 │
│                     (Usuário Autenticado)                   │
└─────────────────────────────────────────────────────────────┘

Usuario → [JWT Token] → PATCH /auth/change-password
                              ↓
                         Valida Token
                              ↓
                         Verifica Senha Atual
                              ↓
                         Atualiza Senha
                              ↓
                         ✅ Senha Trocada!


┌─────────────────────────────────────────────────────────────┐
│                  FLUXO 2: Forgot/Reset Password             │
│                    (Sem Autenticação)                       │
└─────────────────────────────────────────────────────────────┘

Usuario → POST /auth/forgot-password
              ↓
         Gera Token (1h)
              ↓
         📧 Envia Email
              ↓
Usuario recebe email com token
              ↓
Usuario → POST /auth/reset-password + token
              ↓
         Valida Token & Expiração
              ↓
         Atualiza Senha
              ↓
         Limpa Token
              ↓
         ✅ Senha Resetada!
```

---

## 🔗 Links Relacionados

- [README.md](../README.md) - Documentação principal
- [API Examples](./api-examples.http) - Exemplos de requisições
- [Auth Service](../src/auth/auth.service.ts) - Implementação

---

Desenvolvido com ❤️ para SuperPet API

