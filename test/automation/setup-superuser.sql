-- Script para criar SUPER_ADMIN para testes
-- Execute este script manualmente no banco de dados antes de rodar os testes

-- 1. Inserir ou atualizar usuário SUPER_ADMIN
INSERT INTO users (id, organization_id, email, name, password, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000099',
  '00000000-0000-0000-0000-000000000001',
  'superadmin@superpet.com.br',
  'Super Admin',
  -- Senha: 'superadmin123' (hash bcrypt com salt 10)
  '$2b$10$6ZqSpLHKKQPKST5jvbzAdu/FlJXmw.j0xxvewJy3wi.2iHubgGywG',
  'ACTIVE',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  email = 'superadmin@superpet.com.br',
  name = 'Super Admin',
  password = '$2b$10$6ZqSpLHKKQPKST5jvbzAdu/FlJXmw.j0xxvewJy3wi.2iHubgGywG',
  status = 'ACTIVE';

-- 2. Inserir ou atualizar employee SUPER_ADMIN
INSERT INTO employees (id, organization_id, user_id, role, active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000099',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000099',
  'SUPER_ADMIN',
  1,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  role = 'SUPER_ADMIN',
  active = 1;

-- Verificar se foi criado corretamente
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  e.id as employee_id,
  e.role,
  e.active
FROM users u
LEFT JOIN employees e ON e.user_id = u.id
WHERE u.email = 'superadmin@superpet.com.br';

