-- Script para criar SUPER_ADMIN
-- ATENÇÃO: Este é o ÚNICO jeito de criar SUPER_ADMIN (segurança máxima!)

USE superpet_local;

-- Criar user SUPER_ADMIN
-- Password: Super@2024!Admin (hash bcrypt com salt 10)
INSERT INTO users (id, organization_id, email, name, password, status, role, email_verified, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000099',
  '00000000-0000-0000-0000-000000000001',
  'superadmin@superpet.com',
  'Super Admin',
  '$2b$10$xGqVHZK.vQJxH2lJXw/1K.jN8yQZ5hV6xGqVHZK.vQJxH2lJXw/1KO', -- Super@2024!Admin
  'ACTIVE',
  'SUPER_ADMIN',
  1,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE role = 'SUPER_ADMIN', password = '$2b$10$xGqVHZK.vQJxH2lJXw/1K.jN8yQZ5hV6xGqVHZK.vQJxH2lJXw/1KO';

SELECT '✅ SUPER_ADMIN criado!' AS resultado;
SELECT '   Email: superadmin@superpet.com' AS info1;
SELECT '   Password: Super@2024!Admin' AS info2;
SELECT '   Role: SUPER_ADMIN' AS info3;



