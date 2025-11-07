import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateServicesTable1729000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'services',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'organization_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Código imutável único por org',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'duration_minutes',
            type: 'int',
            isNullable: false,
            comment: '1 a 480 minutos',
          },
          {
            name: 'buffer_before',
            type: 'int',
            default: 0,
            comment: '0 a 120 minutos',
          },
          {
            name: 'buffer_after',
            type: 'int',
            default: 0,
            comment: '0 a 120 minutos',
          },
          {
            name: 'resources_required',
            type: 'json',
            isNullable: true,
            comment: 'Array: ["GROOMER", "TABLE"]',
          },
          {
            name: 'visibility',
            type: 'enum',
            enum: ['PUBLIC', 'INTERNAL', 'HIDDEN'],
            default: "'PUBLIC'",
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'price_base_cents',
            type: 'int',
            isNullable: false,
            comment: 'Preço em centavos',
          },
          {
            name: 'tax_code',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'addons',
            type: 'json',
            isNullable: true,
            comment: 'Array de serviceIds (addons)',
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
      'services',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'services',
      new TableIndex({
        name: 'IDX_SERVICE_ORG_CODE',
        columnNames: ['organization_id', 'code'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'services',
      new TableIndex({
        name: 'IDX_SERVICE_VISIBILITY',
        columnNames: ['visibility'],
      }),
    );

    await queryRunner.createIndex(
      'services',
      new TableIndex({
        name: 'IDX_SERVICE_ACTIVE',
        columnNames: ['active'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('services');
  }
}







