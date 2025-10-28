import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCustomServicesTable1729000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'custom_services',
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
            name: 'service_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'state',
            type: 'enum',
            enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
            default: "'DRAFT'",
            isNullable: false,
          },
          {
            name: 'price_override_cents',
            type: 'int',
            isNullable: true,
            comment: 'Preço customizado em centavos',
          },
          {
            name: 'duration_minutes_override',
            type: 'int',
            isNullable: true,
            comment: '1 a 480 minutos',
          },
          {
            name: 'visibility_override',
            type: 'enum',
            enum: ['PUBLIC', 'INTERNAL', 'HIDDEN'],
            isNullable: true,
          },
          {
            name: 'resources_override',
            type: 'json',
            isNullable: true,
            comment: 'Array: ["GROOMER", "TABLE"]',
          },
          {
            name: 'addons_override',
            type: 'json',
            isNullable: true,
            comment: 'Array de serviceIds',
          },
          {
            name: 'local_notes',
            type: 'text',
            isNullable: true,
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
      }),
      true,
    );

    // FKs
    await queryRunner.createForeignKey(
      'custom_services',
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'custom_services',
      new TableForeignKey({
        columnNames: ['service_id'],
        referencedTableName: 'services',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Índice único: um custom service por store+service
    await queryRunner.createIndex(
      'custom_services',
      new TableIndex({
        name: 'IDX_CUSTOM_SERVICE_STORE_SERVICE',
        columnNames: ['store_id', 'service_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'custom_services',
      new TableIndex({
        name: 'IDX_CUSTOM_SERVICE_STATE',
        columnNames: ['state'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('custom_services');
  }
}






