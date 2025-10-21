import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowNullOrganizationForSuperAdmin1729000000022
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Permitir organization_id NULL para SUPER_ADMIN
    await queryRunner.query(`
      ALTER TABLE users 
      MODIFY COLUMN organization_id VARCHAR(36) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter para NOT NULL
    await queryRunner.query(`
      ALTER TABLE users 
      MODIFY COLUMN organization_id VARCHAR(36) NOT NULL
    `);
  }
}

