# 📁 Diretório de Ambientes

Este diretório contém os arquivos de configuração de ambiente para diferentes contextos de execução.

## 📋 Arquivos

- `template.env` - Template base para criar novos ambientes
- `local.env` - Configurações para desenvolvimento local (gitignored)
- `staging.env` - Configurações para ambiente de staging (gitignored)
- `prod.env` - Configurações para ambiente de produção (gitignored)

## 🚀 Como Usar

### 1. Criar arquivo de ambiente local

```bash
# Windows (PowerShell)
Copy-Item env\template.env env\local.env

# Linux/Mac
cp env/template.env env/local.env
```

### 2. Editar as configurações

Abra o arquivo `env/local.env` e configure:
- `NODE_ENV=local` (para desenvolvimento local)
- Credenciais do banco de dados
- Secrets do JWT (gere valores aleatórios fortes)
- Porta da aplicação

### 3. Aplicar para outros ambientes

Repita o processo para `staging.env` e `prod.env`, ajustando os valores conforme necessário:

```bash
# Staging
Copy-Item env\template.env env\staging.env  # Windows
cp env/template.env env/staging.env         # Linux/Mac

# Production
Copy-Item env\template.env env\prod.env     # Windows
cp env/template.env env/prod.env            # Linux/Mac
```

## ⚠️ Importante

- **NUNCA** commite arquivos `.env.*` no git (exceto `.env.template`)
- Use secrets diferentes para cada ambiente
- Em produção, use secrets com no mínimo 32 caracteres
- Mantenha os arquivos `.env.*` seguros e privados

## 🔐 Gerando Secrets Seguros

### Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### OpenSSL
```bash
openssl rand -hex 64
```

### PowerShell (Windows)
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

---

Para mais informações, consulte [ENVIRONMENTS.md](../docs/guides/ENVIRONMENTS.md).

