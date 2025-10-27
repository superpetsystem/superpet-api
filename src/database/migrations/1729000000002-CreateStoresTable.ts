import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateStoresTable1729000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'stores',
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
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '50',
            default: "'America/Manaus'",
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'json',
            isNullable: true,
            comment: 'JSON: { street, number, district, city, state, zip, country }',
          },
          {
            name: 'opening_hours',
            type: 'json',
            isNullable: true,
            comment: 'JSON: { mon: [["08:00","12:00"]], ... }',
          },
          {
            name: 'blackout_dates',
            type: 'json',
            isNullable: true,
            comment: 'Array de datas YYYY-MM-DD',
          },
          {
            name: 'resources_catalog',
            type: 'json',
            isNullable: true,
            comment: 'Array: ["GROOMER", "TABLE", "VET_ROOM"]',
          },
          {
            name: 'capacity',
            type: 'json',
            isNullable: true,
            comment: 'JSON: { GROOMER: 3, TABLE: 4 }',
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
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
      'stores',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'stores',
      new TableIndex({
        name: 'IDX_STORE_ORG_CODE',
        columnNames: ['organization_id', 'code'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'stores',
      new TableIndex({
        name: 'IDX_STORE_ACTIVE',
        columnNames: ['active'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('stores');
  }
}




