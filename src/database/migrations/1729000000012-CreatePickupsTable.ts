import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePickupsTable1729000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pickups',
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
            name: 'customer_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'pet_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'pickup_window_start',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'pickup_window_end',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'address_override',
            type: 'json',
            isNullable: true,
            comment: 'JSON com endereço completo se não usar primário',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['REQUESTED', 'CONFIRMED', 'IN_ROUTE', 'COMPLETED', 'CANCELED'],
            default: "'REQUESTED'",
            isNullable: false,
          },
          {
            name: 'notes',
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
        ],
      }),
      true,
    );

    // FKs
    await queryRunner.createForeignKey(
      'pickups',
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'pickups',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'pickups',
      new TableForeignKey({
        columnNames: ['pet_id'],
        referencedTableName: 'pets',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'pickups',
      new TableIndex({
        name: 'IDX_PICKUP_STORE_DATE',
        columnNames: ['store_id', 'pickup_window_start'],
      }),
    );

    await queryRunner.createIndex(
      'pickups',
      new TableIndex({
        name: 'IDX_PICKUP_STATUS',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pickups');
  }
}






