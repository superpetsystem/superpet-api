import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateStoreFeaturesTable1729000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'store_features',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'store_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'feature_key',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Chave da feature (referência a features.key)',
          },
          {
            name: 'access_type',
            type: "enum",
            enum: ['STORE', 'CUSTOMER'],
            default: "'STORE'",
            isNullable: true,
          },
          {
            name: 'enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'limits',
            type: 'json',
            isNullable: true,
            comment: 'JSON: limites específicos da feature (ex: dailyPickups)',
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
        ],
      }),
      true,
    );

    // FK
    await queryRunner.createForeignKey(
      'store_features',
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Índice único: uma feature por store
    await queryRunner.createIndex(
      'store_features',
      new TableIndex({
        name: 'IDX_STORE_FEATURE_UNIQUE',
        columnNames: ['store_id', 'feature_key'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'store_features',
      new TableIndex({
        name: 'IDX_STORE_FEATURE_KEY',
        columnNames: ['feature_key'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('store_features');
  }
}


