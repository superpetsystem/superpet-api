import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FixTokenBlacklistTimestamps1761657500000 implements MigrationInterface {
  name = 'FixTokenBlacklistTimestamps1761657500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('token_blacklist');
    if (!hasTable) return;

    const table = await queryRunner.getTable('token_blacklist');
    if (table && !table.findColumnByName('created_at')) {
      await queryRunner.addColumn(
        'token_blacklist',
        new TableColumn({
          name: 'created_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP',
          isNullable: false,
        }),
      );
    }
    if (table && !table.findColumnByName('updated_at')) {
      await queryRunner.addColumn(
        'token_blacklist',
        new TableColumn({
          name: 'updated_at',
          type: 'timestamp',
          default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          isNullable: false,
        }),
      );
    }

    if (table && table.findColumnByName('createdAt')) {
      await queryRunner.dropColumn('token_blacklist', 'createdAt');
    }
    if (table && table.findColumnByName('updatedAt')) {
      await queryRunner.dropColumn('token_blacklist', 'updatedAt');
    }
    if (table && table.findColumnByName('deletedAt')) {
      await queryRunner.dropColumn('token_blacklist', 'deletedAt');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('token_blacklist');
    if (!hasTable) return;
    // Recreate camelCase if needed (not strictly necessary for down)
    await queryRunner.query(`
      ALTER TABLE token_blacklist
      ADD COLUMN IF NOT EXISTS createdAt timestamp NULL,
      ADD COLUMN IF NOT EXISTS updatedAt timestamp NULL,
      ADD COLUMN IF NOT EXISTS deletedAt timestamp NULL
    `);
    try {
      await queryRunner.query(`ALTER TABLE token_blacklist DROP COLUMN created_at`);
    } catch (_) {}
    try {
      await queryRunner.query(`ALTER TABLE token_blacklist DROP COLUMN updated_at`);
    } catch (_) {}
  }
}


