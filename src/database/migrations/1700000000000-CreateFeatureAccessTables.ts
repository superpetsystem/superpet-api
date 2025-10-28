import { MigrationInterface, QueryRunner, Table, TableIndex, TableColumn } from 'typeorm';

export class CreateFeatureAccessTables1700000000000 implements MigrationInterface {
  name = 'CreateFeatureAccessTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela store_feature_access
    await queryRunner.createTable(
      new Table({
        name: 'store_feature_access',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isNullable: false,
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
          },
          {
            name: 'access_type',
            type: 'enum',
            enum: ['STORE_ONLY', 'STORE_AND_CUSTOMER'],
            default: "'STORE_ONLY'",
            isNullable: false,
          },
          {
            name: 'customer_access_config',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'enabled',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [],
      }),
      true,
    );

    // Criar índices
    await queryRunner.createIndex(
      'store_feature_access',
      new TableIndex({
        name: 'IDX_STORE_FEATURE_ACCESS_UNIQUE',
        columnNames: ['store_id', 'feature_key'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'store_feature_access',
      new TableIndex({
        name: 'IDX_STORE_FEATURE_ACCESS_STORE',
        columnNames: ['store_id'],
      }),
    );

    await queryRunner.createIndex(
      'store_feature_access',
      new TableIndex({
        name: 'IDX_STORE_FEATURE_ACCESS_TYPE',
        columnNames: ['access_type'],
      }),
    );

    await queryRunner.createIndex(
      'store_feature_access',
      new TableIndex({
        name: 'IDX_STORE_FEATURE_ACCESS_ENABLED',
        columnNames: ['enabled'],
      }),
    );

    // Adicionar coluna metadata na tabela features se não existir
    const featuresTable = await queryRunner.getTable('features');
    if (featuresTable && !featuresTable.findColumnByName('metadata')) {
      await queryRunner.addColumn(
        'features',
        new TableColumn({
          name: 'metadata',
          type: 'json',
          isNullable: true,
        }),
      );
    }

    // Adicionar coluna divisible na tabela features se não existir
    if (featuresTable && !featuresTable.findColumnByName('divisible')) {
      await queryRunner.addColumn(
        'features',
        new TableColumn({
          name: 'divisible',
          type: 'boolean',
          default: false,
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.dropIndex('store_feature_access', 'IDX_STORE_FEATURE_ACCESS_UNIQUE');
    await queryRunner.dropIndex('store_feature_access', 'IDX_STORE_FEATURE_ACCESS_STORE');
    await queryRunner.dropIndex('store_feature_access', 'IDX_STORE_FEATURE_ACCESS_TYPE');
    await queryRunner.dropIndex('store_feature_access', 'IDX_STORE_FEATURE_ACCESS_ENABLED');

    // Remover tabela
    await queryRunner.dropTable('store_feature_access');

    // Remover colunas adicionadas na tabela features
    const featuresTable = await queryRunner.getTable('features');
    if (featuresTable) {
      if (featuresTable.findColumnByName('metadata')) {
        await queryRunner.dropColumn('features', 'metadata');
      }
      if (featuresTable.findColumnByName('divisible')) {
        await queryRunner.dropColumn('features', 'divisible');
      }
    }
  }
}
