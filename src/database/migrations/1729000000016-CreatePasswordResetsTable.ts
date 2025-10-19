import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePasswordResetsTable1729000000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'password_resets',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
          },
          {
            name: 'used',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        indices: [
          {
            name: 'IDX_PASSWORD_RESET_TOKEN',
            columnNames: ['token'],
          },
          {
            name: 'IDX_PASSWORD_RESET_USER',
            columnNames: ['user_id'],
          },
          {
            name: 'IDX_PASSWORD_RESET_EXPIRES',
            columnNames: ['expires_at'],
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'password_resets',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('password_resets');
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.indexOf('user_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('password_resets', foreignKey);
      }
    }
    await queryRunner.dropTable('password_resets');
  }
}

