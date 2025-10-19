import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTokenBlacklistTable1729000000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'token_blacklist',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'tokenHash',
            type: 'varchar',
            length: '64',
            isUnique: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '50',
            default: "'logout'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
            default: null,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'token_blacklist',
      new TableIndex({
        name: 'IDX_TOKEN_BLACKLIST_HASH',
        columnNames: ['tokenHash'],
      }),
    );

    await queryRunner.createIndex(
      'token_blacklist',
      new TableIndex({
        name: 'IDX_TOKEN_BLACKLIST_EXPIRES',
        columnNames: ['expiresAt'],
      }),
    );

    await queryRunner.createIndex(
      'token_blacklist',
      new TableIndex({
        name: 'IDX_TOKEN_BLACKLIST_USER',
        columnNames: ['userId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('token_blacklist');
  }
}

