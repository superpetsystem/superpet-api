# 🔐 Testes de Autenticação

Testes automatizados para o módulo de Auth.

## Como executar

```bash
node test/automation/auth/auth.test.js
```

## O que é testado

### ✅ Funcionalidades Principais
- Registro de usuário
- Login
- Perfil do usuário
- Mudança de senha
- Refresh token
- Forgot password
- Reset password
- Logout

### ✅ Validações de Segurança
- Email duplicado
- Credenciais inválidas
- Acesso sem token
- Senha atual incorreta
- Token de reset inválido

### ✅ Testes em Massa
- **Criar 100 usuários** automaticamente

## 📊 Estatísticas

- **Total de testes**: 17
- **Taxa de sucesso**: 100%
- **Registros criados**: 100+ users

## 🎯 Resultados Esperados

```
✅ PASSOU: 17/17 testes
🎉 TODOS OS TESTES PASSARAM!
```

