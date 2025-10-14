# 🌍 Guia de Ambientes - SuperPet API

Este documento explica como configurar e gerenciar diferentes ambientes (local, staging, production).

## 📋 Ambientes Disponíveis

Todos os arquivos de ambiente estão organizados na pasta `env/` na raiz do projeto.

### 1. **Local (Development)** 
- Arquivo: `env/local.env`
- Comando: `npm run start:local`
- Para desenvolvimento local
- Banco de dados local

### 2. **Staging**
- Arquivo: `env/staging.env`
- Comando: `npm run start:staging`
- Para testes em ambiente similar à produção
- Banco de dados de staging

### 3. **Production**
- Arquivo: `env/prod.env`
- Comando: `npm run start:prod`
- Para ambiente de produção
- Banco de dados de produção

---

## ⚙️ Configuração Inicial

### 1. Criar os arquivos de ambiente

Crie os arquivos baseado no template dentro da pasta `env/`:

```bash
# Windows (PowerShell)
Copy-Item env\template.env env\local.env

# Linux/Mac
cp env/template.env env/local.env
```

### 2. Configurar cada ambiente

#### `env/local.env` (Desenvolvimento)
```env
NODE_ENV=local

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=superpet_db

JWT_SECRET=local-dev-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=local-dev-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
```

#### `env/staging.env` (Staging)
```env
NODE_ENV=staging

DB_HOST=staging-db.example.com
DB_PORT=3306
DB_USERNAME=superpet_staging
DB_PASSWORD=<strong-password>
DB_DATABASE=superpet_staging_db

JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<generate-strong-secret>
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
```

#### `env/prod.env` (Production)
```env
NODE_ENV=production

DB_HOST=prod-db.example.com
DB_PORT=3306
DB_USERNAME=superpet_prod
DB_PASSWORD=<very-strong-password>
DB_DATABASE=superpet_prod_db

JWT_SECRET=<generate-very-strong-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<generate-very-strong-secret>
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
```

---

## 🚀 Comandos por Ambiente

### Desenvolvimento (Local)

```bash
# Iniciar aplicação
npm run start:local

# Migrations
npm run migration:run:local
npm run migration:revert:local
npm run migration:show:local
npm run migration:generate:local src/database/migrations/NomeMigration
```

### Staging

```bash
# Build da aplicação
npm run build

# Migrations
npm run migration:run:staging
npm run migration:show:staging

# Iniciar aplicação
npm run start:staging
```

### Production

```bash
# Build da aplicação
npm run build

# Migrations
npm run migration:run:production
npm run migration:show:production

# Iniciar aplicação
npm run start:prod
```

---

## 🔐 Gerando Secrets Seguros

Para gerar secrets fortes para JWT em staging e production:

### Usando Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Usando OpenSSL
```bash
openssl rand -hex 64
```

### Usando PowerShell (Windows)
```powershell
[System.Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 🗄️ Configuração do Banco de Dados

### Local (MySQL)

1. Instalar MySQL 8.0+
2. Criar banco de dados:

```sql
CREATE DATABASE superpet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Configurar usuário (opcional):

```sql
CREATE USER 'superpet_local'@'localhost' IDENTIFIED BY 'senha_local';
GRANT ALL PRIVILEGES ON superpet_db.* TO 'superpet_local'@'localhost';
FLUSH PRIVILEGES;
```

### Staging

1. Criar banco de dados no servidor:

```sql
CREATE DATABASE superpet_staging_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Criar usuário dedicado:

```sql
CREATE USER 'superpet_staging'@'%' IDENTIFIED BY 'senha_forte_staging';
GRANT ALL PRIVILEGES ON superpet_staging_db.* TO 'superpet_staging'@'%';
FLUSH PRIVILEGES;
```

### Production

1. Criar banco de dados:

```sql
CREATE DATABASE superpet_prod_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Criar usuário dedicado com privilégios restritos:

```sql
CREATE USER 'superpet_prod'@'%' IDENTIFIED BY 'senha_muito_forte_production';
GRANT SELECT, INSERT, UPDATE, DELETE ON superpet_prod_db.* TO 'superpet_prod'@'%';
FLUSH PRIVILEGES;
```

---

## 📦 Deploy

### Processo Recomendado

#### 1. Desenvolvimento Local

```bash
# 1. Desenvolver feature
# 2. Testar localmente
npm run start:dev

# 3. Criar/aplicar migrations
npm run migration:generate:local src/database/migrations/NovaFeature
npm run migration:run:local

# 4. Commit e push
git add .
git commit -m "feat: nova feature"
git push origin develop
```

#### 2. Deploy para Staging

```bash
# No servidor de staging
git pull origin develop
npm install
npm run build

# Aplicar migrations
npm run migration:run:staging

# Iniciar aplicação (com PM2, por exemplo)
pm2 restart superpet-api-staging
```

#### 3. Deploy para Production

```bash
# Fazer merge para main/master
git checkout main
git merge develop
git push origin main

# No servidor de produção
git pull origin main
npm install --production
npm run build

# BACKUP DO BANCO ANTES!
mysqldump -u root -p superpet_prod_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Aplicar migrations
npm run migration:run:production

# Iniciar aplicação
pm2 restart superpet-api-production
```

---

## 🔍 Verificação de Ambiente

### Verificar qual ambiente está rodando

```bash
echo $NODE_ENV   # Linux/Mac
echo $env:NODE_ENV   # Windows PowerShell
```

### Verificar configuração do banco

```bash
# Testar conexão
npm run migration:show:local
npm run migration:show:staging
npm run migration:show:production
```

---

## 🛡️ Segurança

### ✅ Checklist de Segurança

- [ ] Arquivos `env/local.env`, `env/staging.env` e `env/prod.env` estão no `.gitignore`
- [ ] Secrets de produção são diferentes de dev/staging
- [ ] Secrets têm no mínimo 32 caracteres
- [ ] Banco de produção tem usuário com privilégios restritos
- [ ] Backups automáticos estão configurados
- [ ] SSL/TLS está habilitado para conexões com banco
- [ ] `synchronize: false` em todos os ambientes (usar migrations)
- [ ] Logs não expõem informações sensíveis

### ❌ NUNCA faça

- Commitar arquivos `env/*.env` no git (exceto `template.env`)
- Usar mesmos secrets em dev e production
- Compartilhar credentials de production
- Usar `root` para conexão em production
- Expor senhas em logs ou mensagens de erro

---

## 📊 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente atual | `development`, `staging`, `production` |
| `DB_HOST` | Host do banco | `localhost`, `db.example.com` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_USERNAME` | Usuário do banco | `superpet_user` |
| `DB_PASSWORD` | Senha do banco | `strong_password_123` |
| `DB_DATABASE` | Nome do banco | `superpet_db` |
| `JWT_SECRET` | Secret do access token | `random_64_char_string` |
| `JWT_EXPIRES_IN` | Validade do access token | `15m`, `1h`, `1d` |
| `JWT_REFRESH_SECRET` | Secret do refresh token | `random_64_char_string` |
| `JWT_REFRESH_EXPIRES_IN` | Validade do refresh token | `7d`, `30d` |
| `PORT` | Porta da aplicação | `3000`, `8080` |

---

## 🐳 Docker (Futuro)

Para facilitar o setup de ambientes, você pode criar containers Docker:

```yaml
# docker-compose.yml (exemplo)
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: superpet_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
    depends_on:
      - db

volumes:
  mysql_data:
```

---

## 📞 Troubleshooting

### Problema: Variáveis de ambiente não são carregadas

**Solução:**
```bash
# Verificar se o arquivo existe
ls -la env/local.env  # Linux/Mac
dir env\local.env     # Windows

# Verificar se NODE_ENV está correto
echo $NODE_ENV     # Linux/Mac
echo $env:NODE_ENV # Windows PowerShell
```

### Problema: Conexão com banco recusada

**Solução:**
1. Verificar se MySQL está rodando
2. Confirmar credentials no `.env.*`
3. Verificar firewall/security groups
4. Testar conexão direta: `mysql -h host -u user -p`

---

Desenvolvido com ❤️ para SuperPet API

